const fs = require("fs/promises");

(async () => {
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

  // commands
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete a file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

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
    if(command.includes(DELETE_FILE)){
      const filePath = command.substring(DELETE_FILE.length + 1)
    }
  });

  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
