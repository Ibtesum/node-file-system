const fs = require("fs/promises");

(async () => {
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const createFile = async (path) => {
    let existingFileHandle;
    try {
      existingFileHandle = await fs.open(path, "r");
      console.log(`File ${path} already exists`);
    } catch (error) {
      if (error.code === "ENOENT") {
        const newFileHandle = await fs.open(path, "w");
        console.log("A new file was successfully created.");
        await newFileHandle.close();
      } else {
        console.error(`Error while checking file: ${error}`);
      }
    } finally {
      if (existingFileHandle) await existingFileHandle.close();
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
        console.error(`Error while deleting the file: ${error}`);
      }
    }
  };

  const renameFile = async (oldPath, newPath) => {
    try {
      console.log(`Renaming ${oldPath} to ${newPath}`);
      await fs.rename(oldPath, newPath);
      console.log("Successfully renamed the file");
    } catch (error) {
      if (error.code === "ENOENT" && error.syscall === "rename") {
        console.log("The file does not exist.");
      } else {
        console.error("Error Occurred: ", error);
      }
    }
  };

  let addedContent;
  const addToFile = async (path, content) => {
    let fileHandler;
    try {
      console.log(`Adding to ${path}`);
      fileHandler = await fs.open(path, "a");
      if (addedContent === content) return;

      await fileHandler.write(content);
      addedContent = content;
      console.log("The content was added successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      if (fileHandler) await fileHandler.close();
    }
  };

  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    try {
      const fileSize = (await commandFileHandler.stat()).size;
      const buffer = Buffer.alloc(fileSize);
      const offset = 0;
      const length = buffer.byteLength;
      const position = 0;

      await commandFileHandler.read(buffer, offset, length, position);

      const command = buffer.toString("utf-8");

      if (command.includes(CREATE_FILE)) {
        const filePath = command
          .substring(command.indexOf(CREATE_FILE) + CREATE_FILE.length)
          .trim();
        await createFile(filePath);
      }

      if (command.includes(DELETE_FILE)) {
        const filePath = command.substring(DELETE_FILE.length + 1).trim();
        await deleteFile(filePath);
      }

      if (command.includes(RENAME_FILE)) {
        const _idx = command.indexOf(" to ");
        const oldFilePath = command
          .substring(RENAME_FILE.length + 1, _idx)
          .trim();
        const newFilePath = command.substring(_idx + " to ".length).trim();
        await renameFile(oldFilePath, newFilePath);
      }

      if (command.includes(ADD_TO_FILE)) {
        const _idx = command.indexOf(" this content: ");
        const filePath = command.substring(ADD_TO_FILE.length + 1, _idx).trim();
        const content = command
          .substring(_idx + " this content: ".length)
          .trim();
        await addToFile(filePath, content);
      }
    } catch (error) {
      console.error("Error processing file change:", error);
    }
  });

  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
