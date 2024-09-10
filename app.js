const fs = require("fs/promises");

(async () => {
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
    const content = await commandFileHandler.read(
      buffer,
      offset,
      length,
      position
    );
    console.log(content);
  });

  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
