import { Injectable } from '@nestjs/common';
import { YellowServiceMock } from './yellow.service.mock';

// For hackathon, we're using the mock service
// In production, this would use the real Nitrolite SDK
@Injectable()
export class YellowService extends YellowServiceMock {
}