const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { trace } = require('@opentelemetry/api');
const { ExpressInstrumentation } = require('opentelemetry-instrumentation-express');
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

module.exports = (serviceName) => {
   const jaegerExporter = new JaegerExporter({
       serviceName: serviceName,
       endpoint: 'http://localhost:14268/api/traces',
   });

   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   });

   provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
   provider.register();

   const instrumentations = [
       new HttpInstrumentation(),
       new ExpressInstrumentation(),
       new MongoDBInstrumentation(),
   ];

   instrumentations.forEach((instrumentation) => {
       instrumentation.setTracerProvider(provider);
       instrumentation.enable();
   });

   return trace.getTracer(serviceName);
};
