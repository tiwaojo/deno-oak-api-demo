import { Application, Router, Context,Next } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import data from "./data.json" assert { type: "json" };

const router = new Router();

router.get("/", (context) => {
  context.response.body = `<!DOCTYPE html>
    <html>
      <head><title>Hello oak!</title><head>
      <body>
        <h1>Hello oak!</h1>
      </body>
    </html>
  `;
})
  .get("/api", (context) => {
    context.response.body = data;
  })
  .get("/api/:dinosaur", (context) => {
    if (context.params && context.params.dinosaur) {
      const filtered = data.filter((dino: { name: string }) =>
        dino.name.toLowerCase() === context.params.dinosaur?.toLowerCase()
      );
      if (filtered.length > 0) {
        context.response.body = filtered;
      }
    } else {
      context.response.status = 404;
    }
  })
  .post("/api", async (context) => {
    const body = await context.request.body();
    const dino = body.value;
    if (dino) {
      data.push(dino);
      context.response.body = data;
    } else {
      context.response.status = 400;
    }
  });
async function responseTime(ctx:Context, next:Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.request.method} ${ctx.request.url} - ${ms}`);
//   ctx.response.set("X-Response-Time", `${ms}ms`);
}

function logger(format: string) {
  format = format || ':method ":url"';

  return async function (ctx:Context, next:Next) {
    const str = format
      .replace(":method", ctx.request.method)
      .replace(":url", ctx.request.url.toString());

    console.log(str);

    await next();
  };
}

const app = new Application();
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
// app.use(logger());
app.use(logger(":method :url"));
app.use(responseTime);

console.log("Server running on port 8000");

await app.listen({ port: 8000 });
