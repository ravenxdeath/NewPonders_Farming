import { _decorator, Component, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { ResourceManager } from './ResourceManager';

const { ccclass, property } = _decorator;

@ccclass('SellZone')
export class SellZone extends Component {
    @property(ResourceManager)
    public resourceManager: ResourceManager = null!;

    @property
    public sellDistance: number = 2.5;

    update(deltaTime: number) {
        if (!this.resourceManager) return;

        const playerPos = GameManager.Instance.getPlayerPosition();
        if (!playerPos) return;

        // Calculate distance between player and the Sell Node
        const distance = Vec3.distance(this.node.worldPosition, playerPos);

        if (distance < this.sellDistance) {
            this.resourceManager.sellCrops();
        }
    }
}