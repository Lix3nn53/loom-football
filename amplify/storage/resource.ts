import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
    name: "loomFootballMatches",
    access: (allow) => ({
        "shared/*": [allow.guest.to(["read", "write", "delete"])],
    }),
});
