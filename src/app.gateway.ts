/* eslint-disable prettier/prettier */
import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway()
export class AppGateway {
	@WebSocketServer()
	server;

	@SubscribeMessage('message')
	handleMessage(@MessageBody() message: string): void {
		this.server.emit('message', message);
	}
}
