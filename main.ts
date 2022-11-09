#!/usr/bin/env node

import {join} from "node:path";
import {start} from "./service.js";
import {__dirname} from "./paths.js";

await start((await import(join(__dirname, "resolvers.js"))).default);
