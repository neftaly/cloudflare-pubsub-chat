import { connect } from "precompiled-mqtt";

const config = {
  tokenEndpoint: 'https://get-broker-token.WORKERS_NAMESPACE.workers.dev',
  broker: "YOUR_BROKER",
  namespace: "PUBSUB_NAMESPACE"
}

const getToken = () =>
  fetch(config.tokenEndpoint)
    .then((response) =>
      response.status === 200
        ? response.json()
        : Promise.reject([
            "Could not connect to pubsub auth: " + response.status,
          ])
    )
    .then(({ success, result, errors }) =>
      success ? result.token : Promise.reject(errors)
    );

const getConnection = ({ broker, namespace, token }) =>
  connect(`mqtts://${broker}.${namespace}.cloudflarepubsub.com:8884`, {
    username: "client",
    password: token,
    clientId: "",
    protocolVersion: 5,
  });

getToken()
  .then((token) => {
    console.log("token", token);

    const client = getConnection({
      broker: config.broker,
      namespace: config.namespace,
      token
    });

    const topic = "session/test";
    client.subscribe(topic);
    client.on("message", (topic, payload) => {
      const [clientId, message] = payload.toString().split(/\n(.*)/s);
      console.log("message", { topic, clientId, message, payload });
    });
    client.on("error", (...args) => {
      console.error("error", ...args);
    });
    client.publish(topic, `'hello at ${Date.now()}'`);
  })
  .catch((error) => console.log("error", error));
