const fs = require("fs/promises");

(async () => {
  // commands
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const createFile = async (path) => {
    try {
      // we want to check whether or not we have that file
      const existingFileHandle = await fs.open(path, "r");
      existingFileHandle.close();

      // We already have that file
      return console.log(`File ${path} already exists`);
    } catch (error) {
      // We dont have the file, now we should create it
      const newFileHandle = await fs.open(path, "w");
      console.log("A new file was successfully created.");
      newFileHandle.close();
    }
  };

  const deleteFile = async (path) => {
    try {
      console.log(`Deleting ${path}...`);
      await fs.unlink(path);
      console.log(`Deleted ${path}.`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("No file at this path to remove.");
      } else {
        console.log(`Error while deleting the file: ${error}`);
      }
    }
  };

  const renameFile = async (oldPath, newPath) => {
    console.log(`Renaming ${oldPath} to ${newPath}`);
    try {
      await fs.rename(oldPath, newPath);
      console.log("successfully renamed the file");
    } catch (error) {
      if (error.code === "ENOENT" && error.syscall === "rename") {
        console.log("The file does not exist. ");
      } else {
        console.log("Error Occured: ", error);
      }
    }
  };

  let addedContent;
  const addToFile = async (path, content) => {
    if (addedContent === content) return;
    console.log(`Adding to ${path}`);
    console.log(`Content: ${content}`);

    try {
      const fileHandler = await fs.open(path, "a");
      fileHandler.write(content);
      addedContent = content;
      console.log("The content was added successfully!");
      fileHandler.close();
    } catch (error) {
      console.log(error);
    }
  };

  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    // get the size of the file
    const fileSize = (await commandFileHandler.stat()).size;
    // allocate a buffer with the size of the file
    const buffer = Buffer.alloc(fileSize);
    // the location of the buffer to start filling our buffer`
    const offset = 0;
    // the length of the buffer to read
    const length = buffer.byteLength;
    // the position of the buffer to start reading
    const position = 0;

    // we always want to read the entire file(from start to end)
    await commandFileHandler.read(buffer, offset, length, position);

    const command = buffer.toString("utf-8");

    // create a file:
    // create a file <path>
    if (command.includes(CREATE_FILE)) {
      const filePath = command
        .substring(command.indexOf(CREATE_FILE) + CREATE_FILE.length)
        .trim();
      await createFile(filePath);
    }

    // delete a file
    // delete the file <path>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    // rename file:
    // rename the file <path> to <new-path>
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
      const newFilePath = command.substring(_idx + " to ".length);
      renameFile(oldFilePath, newFilePath);
    }

    // add to file:
    // add to the file <path> this content: <content>
    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" this content: ");
      const filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
      const content = command.substring(_idx + " this content: ".length);
      addToFile(filePath, content);
    }
  });

  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
