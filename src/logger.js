export class Logger {
  constructor(config) {
    this.config = config;
  }

  log(...messages) {
    if (this.config.DEBUG_MODE) {
      console.log(messages);
    }
  }

  info(...messages) {
    if (this.config.DEBUG_MODE) {
      console.log(messages);
    }
  }

  debug(...messages) {
    if (this.config.DEBUG_MODE) {
      console.debug(messages);
    }
  }

  error(...messages) {
    if (this.config.DEBUG_MODE) {
      console.error(messages);
    }
  }
}
