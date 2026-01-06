import { response } from "@aerokit/sdk/http";

response.println(JSON.stringify({
    status: `Hello World!`
}));