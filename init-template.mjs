#! /usr/bin/env node
/* eslint-disable no-undef */

import readline from 'readline/promises';

import fs from 'fs/promises';
import path from 'path';

const dryRun = false;
const ignore = /.git|node_modules|test-results|playwright-report|dist|types|init-template.mjs/;

const questions = [
  {
    placeholder: 'placeholder-lib-name',
    description: 'library name',
    validation: (v) => v.length > 0, // is this a RegExp
    // validation: (v) => v.match(/.*/), // is this a RegExp
  },
  {
    placeholder: '<<DESCRIPTION>>',
    description: 'description of the library',
    validation: (v) => v.length > 0,
  },
  {
    placeholder: '<<AUTHOR>>',
    description: 'your name',
    validation: (v) => v.length > 0,
  },
  {
    placeholder: '<<GIT-USERNAME>>',
    description: 'git username',
    validation: (v) => v.length > 0,
  },
];

async function crawlAndReplaceStrings(options, replacements) {
  try {
    const files = await crawlFolder(
      options.folderPath,
      options.ignore,
      options.dryRun
    );

    // console.log('files are', files);
    for (const file of files) {
      await replaceInFile(file, replacements);
    }
  } catch (error) {
    console.error('Replacement error:', error);
  }
}

async function crawlFolder(folderPath, ignore) {
  const files = [];

  const items = await fs.readdir(folderPath);
  for (const item of items) {

    if (item.match(ignore)) {
      continue;
    }
    // if (ignore.any((v) => ))

    // if (item.includes(ignore[0])) continue;

    const itemPath = path.join(folderPath, item);
    const itemStats = await fs.stat(itemPath);

    if (itemStats.isDirectory()) {
      const subFolderFiles = await crawlFolder(itemPath, ignore, dryRun);
      files.push(...subFolderFiles);
    } else {
      files.push(itemPath);
    }
  }

  return files;
}

async function replaceInFile(filePath, replacements, dryRun) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');

    let matched = false;

    const re = new RegExp(Object.keys(replacements).join('|'), 'gi');
    const replacedContent = fileContent.replace(re, function (val) {
      matched = true;
      return replacements[val];
    });

    if (!matched) return;

    if (!dryRun) {
        await fs.writeFile(filePath, replacedContent, 'utf8');
    }
  } catch (error) {
    console.error(`Error replacing in ${filePath}:`, error.message);
  }
}

async function main() {
  const dirname = path.resolve(path.dirname(''));

  //
  let currentIndex = 0;
  const replacements = {}; // key is placeholder, value is value

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (currentIndex < questions.length) {
    const question = questions[currentIndex];
    const ans = await rl.question(`${question.description}: `);

    if (!question.validation(ans)) {
      rl.write('Bad input, try again \n');
      continue;
    }

    replacements[question.placeholder] = ans;

    currentIndex++;
  }

  const isSure = await rl.question("Are you sure inputs are correct? (n/Y) ");

  if (isSure.startsWith("n") || isSure.startsWith("N")) {
    rl.write("aborted \n");
    process.exit(0);
  }

  if (dryRun)
    rl.write('dryRunning this...\n');
  else 
    rl.write('working...\n');


  await crawlAndReplaceStrings(
    {
      folderPath: dirname,
      ignore: ignore,
      // dryRun,
    },
    replacements
  );

  rl.write("done\n");
  process.exit(0);

}

main().catch((err) => {
  console.error('fatal error', err);
});
