import { Container, decorate, injectable } from "inversify";
import { Papr } from "./papr";
import { UserService } from "./userService";
import PaprClass from "papr";
import { ImageHistoryService } from "./imageHistoryService";
import { GuildService } from "./guildService";
const databaseContainer = new Container({ skipBaseClassChecks: true });

decorate(injectable(), PaprClass);
databaseContainer.bind(Papr).toSelf().inSingletonScope();
databaseContainer.bind(UserService).toSelf();
databaseContainer.bind(ImageHistoryService).toSelf();
databaseContainer.bind(GuildService).toSelf();

export { databaseContainer };
