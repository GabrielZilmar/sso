import { HttpMethod } from "~/types/http-methods";
import EndpointBuilder from "~services/webserver/express/utils/endpoint-builder";

export default EndpointBuilder.new("/api/hello-world")
  .setHttpMethod(HttpMethod.GET)
  .setHandler(async (_, res) => {
    res.status(200).send({ msg: "Hello World!" });
  });
