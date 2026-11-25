import assert from "node:assert/strict";
import test, { mock } from "node:test";
import type { NextFunction, Request, Response } from "express";
import type { PoolClient } from "pg";
import pool from "../config/db.js";
import { authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getAssignedIssueById,
} from "../models/maintenance.model.js";
import {
  deactivateManagerDepartmentStaff,
} from "../models/manager.model.js";
import {
  requireWorkflowFeature,
  IssueWorkflowError,
  isIssuePriority,
  validateIssueTransition,
  withTransaction,
  type IssueStatus,
} from "./issueWorkflow.js";

test("issue workflow accepts every permitted transition", () => {
  const transitions: Array<[string, IssueStatus]> = [
    ["pending", "under_review"],
    ["pending", "rejected"],
    ["submitted", "under_review"],
    ["submitted", "rejected"],
    ["under_review", "assigned"],
    ["under_review", "rejected"],
    ["assigned", "in_progress"],
    ["in_progress", "resolved"],
    ["resolved", "closed"],
  ];

  for (const [current, next] of transitions) {
    assert.doesNotThrow(() =>
      validateIssueTransition(current, next)
    );
  }
});

test("issue priority validation accepts only supported values", () => {
  for (const priority of ["low", "medium", "high", "critical"]) {
    assert.equal(isIssuePriority(priority), true);
  }

  for (const priority of ["urgent", "", null, undefined, 1]) {
    assert.equal(isIssuePriority(priority), false);
  }
});

test("issue workflow rejects invalid, repeated, and terminal transitions", () => {
  const transitions: Array<[string | null, IssueStatus]> = [
    ["submitted", "assigned"],
    ["under_review", "in_progress"],
    ["assigned", "resolved"],
    ["resolved", "in_progress"],
    ["closed", "under_review"],
    ["rejected", "under_review"],
    [null, "submitted"],
  ];

  for (const [current, next] of transitions) {
    assert.throws(
      () =>
        validateIssueTransition(current, next),
      (error: unknown) =>
        error instanceof IssueWorkflowError && error.statusCode === 409
    );
  }
});

test("workflow features fail explicitly until the migration is available", () => {
  assert.throws(
    () => requireWorkflowFeature(false, "status history"),
    (error: unknown) =>
      error instanceof IssueWorkflowError &&
      error.statusCode === 409 &&
      error.message.includes("status history")
  );
  assert.doesNotThrow(() =>
    requireWorkflowFeature(true, "status history")
  );
});

test("issue workflow transaction rolls back failed operations", async (context) => {
  const statements: string[] = [];
  let released = false;
  const operationError = new Error("simulated write failure");
  const client = {
    query: async (statement: string) => {
      statements.push(statement);
      if (statement === "SIMULATE FAILURE") {
        throw operationError;
      }
      return { rows: [] };
    },
    release: () => {
      released = true;
    },
  } as unknown as PoolClient;

  context.mock.method(pool, "connect", async () => client);

  await assert.rejects(
    withTransaction(async (transactionClient) => {
      await transactionClient.query("SIMULATE FAILURE");
    }),
    (error: unknown) => error === operationError
  );

  assert.deepEqual(statements, ["BEGIN", "SIMULATE FAILURE", "ROLLBACK"]);
  assert.equal(released, true);
});

test("role middleware rejects unauthorized users and permits the required role", async () => {
  const createResponse = (role?: string) => {
    const state: {
      statusCode?: number;
      payload?: unknown;
      nextCalled: boolean;
    } = { nextCalled: false };
    const response = {
      locals: role ? { session: { user: { role } } } : {},
      status(statusCode: number) {
        state.statusCode = statusCode;
        return this;
      },
      json(payload: unknown) {
        state.payload = payload;
        return this;
      },
    };

    return { response: response as unknown as Response, state };
  };

  const next = ((..._args: unknown[]) => undefined) as NextFunction;
  const denied = createResponse("citizen");
  await authorizeRoles("department_manager")(
    {} as Request,
    denied.response,
    next
  );
  assert.equal(denied.state.statusCode, 403);

  const allowed = createResponse("department_manager");
  let nextCalled = false;
  await authorizeRoles("department_manager")(
    {} as Request,
    allowed.response,
    (() => {
      nextCalled = true;
    }) as NextFunction
  );
  assert.equal(nextCalled, true);
  assert.equal(allowed.state.statusCode, undefined);
});

test("maintenance task lookup requires active department membership", async (context) => {
  let queryText = "";
  context.mock.method(pool, "query", async (text: string) => {
    queryText = text;
    return { rows: [] };
  });

  const issue = await getAssignedIssueById(
    "00000000-0000-4000-8000-000000000001",
    "staff-id"
  );

  assert.equal(issue, null);
  assert.match(queryText, /JOIN department_staff_members dsm/);
  assert.match(queryText, /dsm\.staff_id = ia\.staff_id/);
  assert.match(queryText, /dsm\.is_active IS TRUE/);
});

test("department staff cannot be deactivated while active tasks remain", async (context) => {
  const statements: string[] = [];
  const departmentId = "00000000-0000-4000-8000-000000000002";
  context.mock.method(pool, "query", async () => ({
    rows: [
      {
        status_history_available: true,
        membership_available: true,
        completion_photos_available: true,
        priority_available: true,
      },
    ],
  }));
  const client = {
    query: async (text: string) => {
      statements.push(text);
      if (text === "BEGIN" || text === "ROLLBACK" || text === "COMMIT") {
        return { rows: [] };
      }
      if (text.includes("FROM departments")) {
        return { rows: [{ id: departmentId, name: "Test department" }] };
      }
      if (text.includes("FROM department_staff_members")) {
        return { rows: [{ staff_id: "staff-id" }] };
      }
      if (text.includes("FROM issue_assignments")) {
        return { rows: [{ id: "00000000-0000-4000-8000-000000000003" }] };
      }
      throw new Error(`Unexpected query: ${text}`);
    },
    release: () => undefined,
  } as unknown as PoolClient;
  context.mock.method(pool, "connect", async () => client);

  await assert.rejects(
    deactivateManagerDepartmentStaff("manager-id", "staff-id"),
    (error: unknown) =>
      error instanceof IssueWorkflowError && error.statusCode === 409
  );
  assert.ok(statements.includes("ROLLBACK"));
  assert.equal(
    statements.some((statement) =>
      statement.includes("UPDATE department_staff_members")
    ),
    false
  );
});
