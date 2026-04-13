import { _decorator, animation, Component } from 'cc';
import { State, StateManager } from './StateManager';
import { CharacterControllerBehavior } from './CharacterController';

const { ccclass, property } = _decorator;

export enum CharacterState {
    IDLE = "IdleState",
    WALK = "WalkState",
    HARVEST = "HarvestState"
}

class CharacterStateContext {
    public AnimationController : animation.AnimationController = null;
}

class IdleState implements State<CharacterStateContext> {
    name: string = CharacterState.IDLE;
    preEnterDelayMs = 0; postEnterDelayMs = 0; preExitDelayMs = 0; postExitDelayMs = 0;
    OnEnter(context: CharacterStateContext) { 
        context.AnimationController.setValue("idle", true); 
        context.AnimationController.setValue("walk", false);
    }
    OnExit(context: CharacterStateContext)  { context.AnimationController.setValue("idle", false); }
}

class WalkState implements State<CharacterStateContext> {
    name: string = CharacterState.WALK;
    preEnterDelayMs = 0; postEnterDelayMs = 0; preExitDelayMs = 0; postExitDelayMs = 0;
    OnEnter(context: CharacterStateContext) { 
        context.AnimationController.setValue("walk", true); 
        context.AnimationController.setValue("idle", false);
    }
    OnExit(context: CharacterStateContext)  { context.AnimationController.setValue("walk", false); }
}

class HarvestState implements State<CharacterStateContext> {
    name: string = CharacterState.HARVEST;
    preEnterDelayMs = 0; postEnterDelayMs = 0; preExitDelayMs = 0; postExitDelayMs = 0;
    OnEnter(context: CharacterStateContext) {
        // The trigger "onHarvest" is fired by Harvester.ts
        context.AnimationController.setValue("idle", false);
        context.AnimationController.setValue("walk", false);
    }
}

@ccclass('CharacterStateController')
export class CharacterStateController extends Component {
    @property(animation.AnimationController)
    public AnimationController : animation.AnimationController = null!;

    @property(CharacterControllerBehavior)
    public CharacterControllerBehavior : CharacterControllerBehavior = null!;

    private m_characterStateContext : CharacterStateContext = new CharacterStateContext();
    private m_stateManager : StateManager<CharacterStateContext> = null!;
    private m_targetState : string = ""; 
    
    start() {
        this.m_characterStateContext.AnimationController = this.AnimationController;
        this.m_stateManager = new StateManager<CharacterStateContext>(this.m_characterStateContext);

        this.m_stateManager.RegisterState(new IdleState());
        this.m_stateManager.RegisterState(new WalkState());
        this.m_stateManager.RegisterState(new HarvestState());

        // FORCE START AT IDLE
        this.m_targetState = CharacterState.IDLE;
        this.m_stateManager.ChangeState(CharacterState.IDLE);
    }

    update(deltaTime: number) {
        if(!this.m_stateManager || !this.CharacterControllerBehavior) return;

        const moveDir = this.CharacterControllerBehavior.m_moveDir;
        const isMoving = moveDir.lengthSqr() > 0.001;
        
        // Check if the trigger was just activated
        const isHarvestingTriggered = this.AnimationController.getValue("onHarvest") === true;

        if (isMoving) {
            if (this.m_targetState !== CharacterState.WALK) {
                this.SetStateSafe(CharacterState.WALK);
            }
        } else if (isHarvestingTriggered) {
            if (this.m_targetState !== CharacterState.HARVEST) {
                this.SetStateSafe(CharacterState.HARVEST);
            }
        } else {
            // Only return to Idle if we aren't currently in the middle of a Harvest swing
            // This allows "Has Exit Time" in the Graph to finish the animation
            if (this.m_targetState !== CharacterState.IDLE && this.m_targetState !== CharacterState.HARVEST) {
                this.SetStateSafe(CharacterState.IDLE);
            }
        }
        
        this.m_stateManager.Update(deltaTime);
    }

    private SetStateSafe(newState: CharacterState) {
        this.m_targetState = newState;
        this.m_stateManager.ChangeState(newState);
    }
}