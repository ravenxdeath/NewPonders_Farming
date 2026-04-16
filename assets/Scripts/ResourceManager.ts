import { _decorator, Component, Label, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResourceManager')
export class ResourceManager extends Component {

    @property(Label) public CropLabel: Label = null!; 
    @property(Label) public CoinLabel: Label = null!; // Link your CoinsCount label here
    
    @property({ type: CCInteger }) public MaxCrops: number = 100; 

    public cropCount: number = 0; 
    public coinCount: number = 0;

    start() {
        this.updateUI();
    }

    public addWheat(amount: number) {
        // Keeping the method name 'addWheat' so Harvester.ts doesn't break
        this.cropCount = Math.min(this.cropCount + amount, this.MaxCrops);
        this.updateUI();
    }

    /**
     * Converts held crops into coins (1:1 ratio)
     */
    public sellCrops() {
        if (this.cropCount <= 0) return;

        this.coinCount += this.cropCount;
        this.cropCount = 0;
        this.updateUI();
    }

    public isFull(): boolean {
        return this.cropCount >= this.MaxCrops;
    }

    public updateUI() {
        if (this.CropLabel) {
            this.CropLabel.string = `Crop: ${this.cropCount}/${this.MaxCrops}`;
        }
        if (this.CoinLabel) {
            this.CoinLabel.string = `Coin: ${this.coinCount}`;
        }
    }
}