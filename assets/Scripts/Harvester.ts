import { _decorator, Component, Node, Vec3, animation } from 'cc';
import { FieldGenerator } from './FieldGenerator'; 
import { ResourceManager } from './ResourceManager'; 
import { shakeNode } from './Helper';

const { ccclass, property } = _decorator;

@ccclass('Harvester')
export class Harvester extends Component {
    
    @property(FieldGenerator) 
    public fieldGenerator: FieldGenerator = null!; 

    @property(ResourceManager) 
    public resourceManager: ResourceManager = null!; 

    @property(animation.AnimationController)
    public animationController: animation.AnimationController = null!;

    @property(Node)
    public harvestCenter: Node = null!;

    @property
    public baseHarvestRadius: number = 2.0; 

    @property
    public harvestCheckInterval: number = 0.1; 

    private timeSinceLastCheck: number = 0;
    private isHarvesting: boolean = false;

    update(deltaTime: number) {
        if (!this.fieldGenerator || !this.resourceManager || this.isHarvesting) return;

        this.timeSinceLastCheck += deltaTime;
        if (this.timeSinceLastCheck >= this.harvestCheckInterval) {
            this.timeSinceLastCheck = 0;
            this.checkForHarvest();
        }
    }

    checkForHarvest() {
        if (this.resourceManager.isFull()) return;

        const harvestOrigin = this.harvestCenter ? this.harvestCenter.worldPosition : this.node.worldPosition;
        const potentialNodes = this.fieldGenerator.getNodesInVicinity(harvestOrigin);
        let cropsInRange: Node[] = [];

        for (let i = 0; i < potentialNodes.length; i++) {
            const wheatNode = potentialNodes[i];
            if (!wheatNode || !wheatNode.isValid) continue; 
            const dist = Vec3.distance(harvestOrigin, wheatNode.worldPosition);
            if (dist <= this.baseHarvestRadius) {
                cropsInRange.push(wheatNode);
            }
        }

        if (cropsInRange.length > 0) {
            this.triggerHarvestSequence(cropsInRange);
        }
    }

    private triggerHarvestSequence(nodes: Node[]) {
        this.isHarvesting = true;
        
        // FIX: Match the lowercase "onharvest" trigger in your Cocos Graph
        this.animationController.setValue("onharvest", true);

        nodes.forEach(node => {
            this.harvestNode(node);
        });

        this.scheduleOnce(() => {
            this.isHarvesting = false;
        }, 0.6); 
    }

    private harvestNode(node: Node) {
        this.fieldGenerator.removeNodeFromGrid(node);
        shakeNode(node, 0.2, 0.05, 4, () => {
            this.resourceManager.addWheat(1);
            node.destroy();
        });
    }
}