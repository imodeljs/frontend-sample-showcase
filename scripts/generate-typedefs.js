const path = require('path');
const fs = require('fs');

process.on('unhandledRejection', err => {
  throw err;
});

function readDirRecursive(dir) {
  return fs.statSync(dir).isDirectory() ?
    Array.prototype.concat(
      ...fs.readdirSync(dir).map(f => readDirRecursive(path.join(dir, f)))
    )
    : dir;
}

function readDir(dir, recursive) {
  const isDirectory = fs.statSync(dir).isDirectory();
  if (recursive) {
    return readDirRecursive(dir);
  } else if (isDirectory) {
    const files = fs.readdirSync(dir);
    if (files) {
      return files.map(file => path.resolve(dir, file));
    }
  } else {
    return [dir];
  }
}

function resolveRequireModules(baseDirname = `./`, recursive = false, regexp = /^\.\//) {
  let files = readDir(baseDirname, recursive);
  if (!Array.isArray(files)) {
    files = [files];
  }
  const fileContext = files
    .reduce((obj, file) => {
      const fileAbsolutePath = `./${path.relative(baseDirname, file).replace(/\\/g, '/')}`;
      if (regexp.test(fileAbsolutePath)) {
        obj[fileAbsolutePath] = fs.readFileSync(file).toString('utf8');
      }
      return obj;
    }, {});

  return fileContext;
};

function parsePackageJson(pathVal) {
  if (pathVal.startsWith(".")) {
    const completed = path.join(process.cwd(), pathVal);
    const pkgFileUri = require.resolve(completed);

    if (pkgFileUri) {
      let name = path.dirname(completed);
      name = name.replace(path.dirname(name), "").replace("\\", "");
      const main = completed.replace(path.dirname(completed), "").replace("\\", "");
      return {
        packageJson: pkgFileUri, value: {
          name,
          version: "0.1.0",
          types: main,
          main
        }
      }
    }

  } else {
    const paths = pathVal.split("/");
    let completed = "";

    for (const pathPart of paths) {
      completed = path.join(completed, pathPart)
      try {
        const pkgFileUri = require.resolve(path.join(completed, "package.json"), { paths: [process.cwd()] });

        if (pkgFileUri) {
          const pkgFile = fs.readFileSync(pkgFileUri).toString();
          return { packageJson: pkgFileUri, value: JSON.parse(pkgFile) }
        }
      } catch {
        continue;
      }
    }
  }
}

const processed = [];

function processDependency(dep) {
  if (processed.includes(dep)) {
    return;
  }

  processed.push(dep);

  const { packageJson, value } = parsePackageJson(dep);
  const { typings, types } = value;
  const validTypes = typings || types;

  let typeDefs;

  if (!validTypes) {
    if (!dep.startsWith("@types")) {
      try {
        ({ package, typeDefs } = processDependency("@types/" + dep))
        value.typings = package.typings || package.types;
      } catch {
        console.log("Could not find types for: " + dep)
        return;
      }
    }
  } else {
    if (dep.startsWith(".")) {
      typeDefs = resolveRequireModules(path.dirname(packageJson), true, /^\.\/.+\.tsx?$/);
    } else {
      typeDefs = resolveRequireModules(path.dirname(packageJson), true, /^\.\/.+\.d\.ts$/);
    }
  }


  return { package: value, typeDefs }
}

function handleExec(source, destination) {
  const formattedSourcePath = path.resolve(process.cwd(), source);
  const pkgFile = fs.readFileSync(formattedSourcePath).toString();
  const pkgJson = JSON.parse(pkgFile);
  const { dependencies, alias } = pkgJson;

  if (!dependencies) {
    throw Error(source + " does not contain dependencies to parse.");
  }

  const generatedFiles = [];
  const filteredDeps = Object.keys(dependencies).filter((val) => !val.startsWith("@types"));

  for (const dep of filteredDeps) {
    const result = processDependency(dep, destination);
    if (result) {
      const { package, typeDefs } = result;

      const version = package.version.split(".").slice(0, 1).concat("x").join(".");

      let depName = dep;
      if (alias && alias[dep]) {
        depName = alias[dep];
      }

      fs.mkdirSync(path.resolve(process.cwd(), destination, depName, version), { recursive: true })
      const fileName = path.join(path.resolve(process.cwd(), destination, depName, version), "types.json");
      fs.writeFileSync(fileName,
        JSON.stringify({
          ...typeDefs,
          "./package.json": JSON.stringify(package),
        }));

      generatedFiles.push({ dependency: depName, version: version, fileName })
    }
  }

  return generatedFiles;
}

module.exports = handleExec;

