import { response } from "@aerokit/sdk/http";
import { files } from "@aerokit/sdk/io";

const fs = files.list('/target/dirigible/repository/root/registry/public/codbex-sample-edm-bank-core');
const bytes = files.readBytes('/target/dirigible/repository/root/registry/public/codbex-sample-edm-bank-core/dummy_statement.pdf');

response.setContentType('application/pdf');
response.write(bytes);
// response.println("Hello World!" + JSON.stringify(fs, null, 4));