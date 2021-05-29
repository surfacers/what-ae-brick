import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { createMachine } from "xstate";

export type PermissionEvent = { type: "CHECK_PERMISSION", data: boolean };

export const permissionMachine = createMachine<{}, PermissionEvent>({
  id: "permission",
  initial: "initialized",
  states: {
    initialized: {
      tags: "not-checked",
      on: {
        CHECK_PERMISSION: "checking"
      }
    },
    checking: {
      tags: "checking",
      invoke: {
        src: "requestPermission",
        onDone: [
          {
            cond: (_, { data: permitted }) => permitted,
            target: "granted",
          },
          { target: "notGranted" },
        ],
      },
    },
    notGranted: {
      tags: "not-permitted",
      on: { CHECK_PERMISSION: "checking" },
    },
    granted: {
      tags: "permitted",
      type: "final",
    },
  },
}, {
  guards: {
    isPermitted: (_, { data: permitted }) => permitted
  }
});

export function useRequestPermission(
  requestPermission: () => Promise<boolean>
) {
  const [state, send] = useMachine(permissionMachine, {
    services: {
      requestPermission: requestPermission,
    },
  });
  const isChecking = state.hasTag("not-checked") || state.hasTag("checking");
  const hasPermission = state.hasTag("permitted");
  const checkPermission = () => send("CHECK_PERMISSION");

  // initially check the permission
  useEffect(() => {
    checkPermission();
  }, []);

  return ({isChecking, hasPermission, checkPermission});
}
