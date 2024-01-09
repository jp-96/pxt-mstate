namespace mstate {

    /**
     * export UML, PlantUML
     * PlantUML Web server: http://www.plantuml.com/plantuml/
     * @param aStateMachine
     * @param aStateName default state
     */
    //% block="UML $aStateMachine $aStateName"
    //% aStateMachine.defl=StateMachines.M1
    //% aStateName.defl="a"
    //% weight=70
    //% group="Command"
    //% shim=mstate::dummy_number_string
    //% advanced=true
    export function exportUml(aStateMachine: StateMachines, aStateName: string
    ) {
        // for the simulator
        const cb = console.log
        cb("@startuml")
        cb("' ")
        cb("' PlantUML Web server:")
        cb("' https://www.plantuml.com/plantuml/")
        cb("' ")
        // top state - machine name
        cb("state __M" + aStateMachine + "__ {")

        // start
        cb("[*] --> " + aStateName)

        // target machine
        const target = mcontroller.getStateMachine(aStateMachine)
        for (const state of target._states) {
            // state
            const descStatePart = (state as any)["descState"]
                ? " : " + ((state as any)["descState"] as string[]).join("\\n")
                : ""
            cb("state " + mstate._simuConvName(state.stateId) + descStatePart)
            for (const trans of state.transitions) {
                // transition
                const transList: string[] = (trans as any)["transList"]
                    ? (trans as any)["transList"] : []
                const descTransList: string[] = (trans as any)["descTransList"]
                    ? (trans as any)["descTransList"] : []
                const trigger = mstate._simuConvName(trans.triggerId)
                transList.forEach((toName, index) => {
                    if (toName == "") {
                        toName = "[*]"
                    }
                    let triggerPart = ""
                    if (trigger) {
                        triggerPart = triggerPart + trigger
                    }
                    let arrow = true
                    let desc = descTransList[index]
                    if (desc) {
                        if (":" == desc.charAt(0)) {
                            arrow = false
                            desc = desc.slice(1)
                        }
                        const a = desc.split("/", 2)
                        if (a[0]) {
                            triggerPart = triggerPart + " [" + a[0] + "]"
                        }
                        if (a[1]) {
                            triggerPart = triggerPart + " / " + a[1]
                        }
                    }
                    if (triggerPart) {
                        triggerPart = " : " + triggerPart
                    }
                    if (arrow) {
                        cb(mstate._simuConvName(state.stateId) + " --> " + toName + triggerPart)
                    } else {
                        cb("state " + mstate._simuConvName(state.stateId) + ": --> " + toName + triggerPart)
                    }
                })  // transList.forEach
            }
        }

        cb("}") // top state - machine name
        cb("' ")
        cb("' generator: https://github.com/jp-rad/pxt-mstate")
        cb("' ")
        cb("' PlantUML Web server:")
        cb("' https://www.plantuml.com/plantuml/")
        cb("' ")
        cb("@enduml")
    }

    /**
     * description UML, PlantUML
     * PlantUML Web server: http://www.plantuml.com/plantuml/
     * @param aDescription
     */
    //% block="description $aDescription"
    //% aDescription.defl="(description)"
    //% weight=60
    //% group="Command"
    //% shim=mstate::dummy_string
    //% advanced=true
    export function descriptionUml(aDescription: string) {
        const aDescriptionList = [aDescription]
        descriptionsUml(aDescriptionList)
    }

    /**
     * UML description
     */
    let _lastDescriptionList: string[] = []

    /**
     * description UML, PlantUML
     * PlantUML Web server: http://www.plantuml.com/plantuml/
     * @param aDescription
     */
    //% block="description $aDescriptionList"
    //% weight=50
    //% group="Command"
    //% shim=mstate::dummy_strings
    //% advanced=true
    export function descriptionsUml(aDescriptionList: string[]) {
        _lastDescriptionList = aDescriptionList
    }

    /**
     * UML last description list
     * @returns list of description
     */
    //% block
    //% shim=mstate::dummy_ret_strings
    //% blockHidden=true
    //% advanced=true
    export function _simuLastDescriptionListUML(): string[] {
        const ret = _lastDescriptionList
        _lastDescriptionList = []
        return ret
    }

    /**
     * UML state
     * @param machineId  machine ID
     * @param stateId state name
     */
    //% block
    //% shim=mstate::dummy_number_number
    //% blockHidden=true
    //% advanced=true
    export function _simuStateUml(machineId: number, stateId: number
    ) {
        // for the simulator
        const state: any = mcontroller.getState(machineId, stateId)
        const descList = _simuLastDescriptionListUML()
        if (0 < descList.length) {
            state["descState"] = (
                (state["descState"] ? state["descState"] : []) as string[]
            ).concat(descList)
        }
    }

    /**
     * UML transition
     * @param machineId machine ID
     * @param stateId state ID
     * @param aTransList array of next state name
     */
    //% block
    //% shim=mstate::dummy_number_number_strings
    //% blockHidden=true
    //% advanced=true
    export function _simuTransitionUml(machineId: number, stateId: number, aTransList: string[]) {
        // for the simulator
        const state = mcontroller.getState(machineId, stateId)
        const lastTrans: any = state.transitions[(state.transitions.length - 1)]
        lastTrans["transList"] = aTransList
        lastTrans["descTransList"] = _simuLastDescriptionListUML()
    }

    /**
     * convert id (number) to state/trigger name (string)
     * @param nameId state id or trigger id
     * @returns state name (string) or trigger name (string): "[<id>]" if undefined
     */
    //% block
    //% shim=mstate::dummy_number_ret_string
    //% blockHidden=true
    //% advanced=true
    export function _simuConvName(nameId: number
    ): string {
        if (0 <= nameId && mname.nameList.length > nameId) {
            return mname.nameList[nameId]
        }
        return "[" + nameId + "]"
    }

}