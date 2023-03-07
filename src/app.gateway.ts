/* eslint-disable prettier/prettier */
import { Logger } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(8081, { cors: true })
export class AppGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() wss: Server;
	private logger: Logger = new Logger('AppGateway');

	afterInit(server: Server) {
		this.logger.log('Inicializado');
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Cliente conectado ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Cliente desconectado ${client.id}`);
	}

	@SubscribeMessage('msgToServer')
	handleMessage(client: Socket, text: string): void {
		this.wss.emit('msgToClient', text);
	}
}
