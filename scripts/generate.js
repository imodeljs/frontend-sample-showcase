const generateTypdefs = require("./generate-typedefs");
const generateModules = require("./generate-modules");
const camelCase = require('lodash.camelcase');
const fs = require("fs");
const path = require("path");
const getClientEnvironment = require("@bentley/react-scripts/config/env");


const args = process.argv.slice(2);

if (args.length === 0) {
  const msg = ["generate script requires two arguments:", "\  1. Location of the package.json", "\  2. destination path for generated files"].join("\n")
  throw Error(msg)
}
if (!args[0] || !fs.existsSync(path.resolve(process.cwd(), args[0])) || path.extname(args[0]).toLowerCase() !== ".json") {
  throw Error("Package JSON source does not exist!");
}

if (!args[1]) {
  throw Error("Must specify the target location!");
}

async function handleExec(source, generatedFilesDest) {

  const env = getClientEnvironment().raw;

  const [generatedTypedefs, generatedModules] = await Promise.all([
    generateTypdefs(source, generatedFilesDest),
    generateModules(source, generatedFilesDest),
  ]);

  const formattedSourcePath = path.resolve(process.cwd(), source);
  const pkgFile = fs.readFileSync(formattedSourcePath).toString();
  const { externalDependencies } = JSON.parse(pkgFile);

  const manifest = externalDependencies
    .map((mod) => {
      return {
        ...mod,
        lib: mod.lib.replace("#{REACT_APP_COMPILER_URL}", env.REACT_APP_COMPILER_URL),
        types: mod.types ? mod.types.replace("#{REACT_APP_COMPILER_URL}", env.REACT_APP_COMPILER_URL) : undefined,
      }
    })
    .concat(
      generatedModules.map((mod) => {
        const typedef = generatedTypedefs.find((td) => td.dependency === mod.dependency);
        return {
          dependency: mod.dependency,
          version: mod.version,
          lib: mod.fileName.replace(path.join(process.cwd(), "public"), "").replace(/\\/g, "/"),
          global: camelCase(mod.dependency),
          types: typedef ? typedef.fileName.replace(path.join(process.cwd(), "public"), "").replace(/\\/g, "/") : undefined,
        }
      })
    );

  const manifestSrcPath = path.join(process.cwd(), "/src/Components/SampleEditor/Modules.json");
  fs.mkdirSync(path.dirname(manifestSrcPath), { recursive: true });
  fs.writeFileSync(manifestSrcPath, JSON.stringify(manifest, undefined, 2));

}

handleExec(args[0], args[1]);