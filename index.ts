import axios from "axios";
import { exec } from "child_process";
import cors from "cors";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Agent } from "https";
import swaggerUi from "swagger-ui-express";

const leagueHttpsPort = 2999;
const leagueHttpsServer = `https://127.0.0.1:${leagueHttpsPort}`;
const port = 8080;
const leagueHttpServer = `http://localhost:${port}`;
const httpsAgent = new Agent({ rejectUnauthorized: false });

async function main() {
    try {
        const openApiResponse = await axios.get(`${leagueHttpsServer}/swagger/v3/openapi.json`, { httpsAgent });
        const spec = openApiResponse.data;
        spec.servers = [{ url: leagueHttpServer }];
        const app = express();
        app.use(cors());
        app.use("/api", swaggerUi.serve, swaggerUi.setup(spec));
        app.use("/*", createProxyMiddleware({
            target: leagueHttpsServer,
            changeOrigin: true,
            agent: httpsAgent
        }))
        app.listen(port, () => {
            console.log("League api is started");
            exec(`start ${leagueHttpServer}/api`)
        })
    } catch (e) {
        console.error(e);
        console.warn("Make sure you are connected to a game");
    }
}

main();