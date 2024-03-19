enum StateMachines {
    M0 = 0,
    M1,
    M2,
    M3,
    M4,
    M5
}

enum ModeExportUML {
    //% block="Diagram and Table"
    Both = 3,           // 11b
    //% block="State Diagram"
    StateDiagram = 1,   // 01b
    //% block="Trigger Table"
    TriggerTable = 2,   // 10b
    //% block="(JSON)"
    JsonDiagram = 0,    // 00b
}

/**
 * mstate blocks: The pxt-mstate extension is a user-defined extension for micro:bit that simplifies state machine coding and visualization using block coding and state diagrams.
 */
//% weight=100 color="#40A070" icon="\uf362"
//% groups="['Command', 'Declare', 'Transition', 'UML]"
namespace mstate {

    /**
     * *device-dependent:* initialize and activate
     */
    namespace deviceSetup {

        mmachine.queueRunToCompletion = (machineId: number) =>
            // raise event : post run-to-completion event queue for calling back runToCompletion()
            control.raiseEvent(MSTATE_BUS_ID.MSTATE_ID_UPDATE, machineId)

        control.onEvent(MSTATE_BUS_ID.MSTATE_ID_UPDATE, 0, function () {
            // on event : post run-to-completion event queue for calling back runToCompletion()
            const machineId = control.eventValue()
            mmachine.runToCompletion(machineId, control.millis())
        })

        basic.forever(function () {
            // do-counter : calling idleTick()
            // loop - 20ms
            mmachine.idleTick(control.millis())
        })

    }

    let _stateId: number
    let _machineId: number

    /**
     * define state
     * @param aStateMachine StateMachines
     * @param aStateName state name
     * @param body code to run
     */
    //% block="define $aStateMachine state $aStateName"
    //% aStateMachine.defl=StateMachines.M0
    //% aStateName.defl="a"
    //% weight=180
    //% group="Declare"
    export function defineState(aStateMachine: StateMachines, aStateName: string, body: () => void) {
        _stateId = mmachine.namestore.getNameIdOrNew(aStateName)
        _machineId = aStateMachine
        body()
        // // uml
        // mstate._simuStateUml(_machineId, _stateId)
        _stateId = -1   // deactive
    }

    /**
     * declare doActivity.
     * @param aEvery interval time (milliseconds)
     * @param body code to run
     */
    //% block="mstate on do every $aEvery ms $counter"
    //% aEvery.shadow="timePicker"
    //% aEvery.defl=1000
    //% handlerStatement
    //% draggableParameters
    //% weight=160
    //% group="Declare"
    export function declareDoActivity(aEvery: number, body: (counter: number) => void) {
        if (mmachine.namestore.NONE_ID < _stateId) {
            mmachine.getState(_machineId, _stateId).doActivityList.push(new mmachine.DoActivity(aEvery, body))
            // // uml
            // mstate._simuStateUml(_machineId, _stateId)
        }
    }

    /**
     * declare state transition.
     * @param aTriggerName trigger name
     * @param aTargetNameList array of target state name 
     * @param body code to run
     */
    //% block="mstate transition trigger $aTriggerName targets $aTargetNameList"
    //% aTriggerName.defl="e"
    //% draggableParameters="reporter"
    //% handlerStatement
    //% weight=130
    //% group="Transition"
    export function declareStateTransition(aTriggerName: string, aTargetNameList: string[], body: () => void) {
        if (mmachine.namestore.NONE_ID < _stateId) {
            const triggerId = mmachine.namestore.getNameIdOrNew(aTriggerName)
            const targetIdList: number[] = []
            for (const s of aTargetNameList) {
                targetIdList.push(mmachine.namestore.getNameIdOrNew(s))
            }
            mmachine.getState(_machineId, _stateId).stateTransitionList.push(new mmachine.StateTransition(triggerId, targetIdList, body))
            // // uml
            // mstate._simuTransitionUml(_machineId, _stateId)
        }
    }

    /**
     * get trigger args.
     * @param aStateMachine StateMachines
     */
    //% block="mstate $aStateMachine trigger args"
    //% aStateMachine.defl=StateMachines.M0
    //% weight=120
    //% group="Transition"
    //% advanced=true
    export function getTriggerArgs(aStateMachine: StateMachines,): number[] {
        return mmachine.getStateMachine(aStateMachine).triggerArgs
    }

    /**
     * traverse, select target index
     * @param aStateMachine StateMachines
     * @param index target index, cancled = (-1)
     */
    //% block="mstate $aStateMachine traverse at $index"
    //% aStateMachine.defl=StateMachines.M0
    //% index.defl=0
    //% weight=110
    //% group="Transition"
    export function traverse(aStateMachine: StateMachines, index: number) {
        mmachine.getStateMachine(aStateMachine).traverseAt = index
    }

    /**
     * send trigger with args
     * @param aStateMachine StateMachines
     * @param aTriggerName trigger name
     * @param aTriggerArgs trigger args
     */
    //% block="send $aStateMachine $aTriggerName||$aTriggerArgs"
    //% aStateMachine.defl=StateMachines.M0
    //% aTriggerName.defl="e"
    //% weight=90
    //% group="Command"
    export function sendTriggerArgs(aStateMachine: StateMachines, aTriggerName: string, aTriggerArgs?: number[]) {
        const triggerId = mmachine.namestore.getNameIdOrNew(aTriggerName)
        mmachine.getStateMachine(aStateMachine).send(triggerId, aTriggerArgs)
    }

    /**
     * start state machine
     * @param aStateMachine StateMachines
     * @param aStateName default state name
     */
    //% block="start $aStateMachine $aStateName"
    //% aStateMachine.defl=StateMachines.M0
    //% aStateName.defl="a"
    //% weight=80
    //% group="Command"
    export function start(aStateMachine: StateMachines, aStateName: string) {
        const stateId = mmachine.namestore.getNameIdOrNew(aStateName)
        mmachine.getStateMachine(aStateMachine).send(mmachine.namestore.SYS_START_TRIGGER_ID, [stateId])    // StarterTransition
    }

    /**
     * UML, description
     * @param aDescription description
     */
    //% block="(UML) description $aDescription"
    //% aDescription.defl="a"
    //% weight=70
    //% group="UML"
    //% advanced=true
    //% shim=shimfake::simuDescriptionUml
    export function descriptionUml(aDescription: string) {
        // uml
        _simuDescriptionUml(aDescription)
    }

    /**
     * UML, export
     * @param aStateMachine StateMachines
     * @param aStateName default state name
     * @param aMode output state-diagram, trigger table, JSON-diagram
     */
    //% block="(UML) $aStateMachine $aStateName||$aMode"
    //% inlineInputMode=inline
    //% aStateMachine.defl=StateMachines.M0
    //% aStateName.defl="a"
    //% aMode.defl=ModeExportUML.Both
    //% weight=60
    //% group="UML"
    //% advanced=true
    //% shim=shimfake::simuExportUml
    export function exportUml(aStateMachine: StateMachines, aStateName: string, aMode: ModeExportUML = ModeExportUML.Both) {
        // uml
        _simuExportUml(aStateMachine, aStateName, aMode)
    }

    /**
     * (internal) UML, description stack
     * for the simulator
     */
    const _lastDescriptionList: string[] = []

    /**
     * (internal) UML, convert id (number) to state/trigger name (string)
     * @param nameId state id or trigger id
     * @returns state name (string) or trigger name (string): "[id]" if undefined
     */
    //% shim=shimfake::simuConvName
    export function _simuConvName(nameId: number): string {
        // for the simulator
        const storeNameId = mmachine.namestore.storeNameId
        let name = Object.keys(storeNameId).find((value) => nameId == storeNameId[value])
        if (undefined === name) {
            name = "[" + nameId + "]"
        }
        return name
    }

    /**
     * (internal) UML, last description list
     * @param n (-1):all, (0): empty [], (>0): n from last
     * @returns list of description
     */
    //% shim=shimfake::simuLastDescriptionListUML
    export function _simuLastDescriptionListUML(n: number): string[] {
        // for the simulator
        const ret: string[] = []
        const stack: string[] = []
        if (0 > n) {
            n = _lastDescriptionList.length
        }
        while ((0 < _lastDescriptionList.length) && (n > stack.length)) {
            stack.push(_lastDescriptionList.pop())
        }
        while (0 < stack.length) {
            ret.push(stack.pop())
        }
        return ret
    }

    /**
     * (internal) UML, state
     * @param machineId  machine id
     * @param stateId state name
     */
    //% shim=shimfake::simuStateUml
    export function _simuStateUml(machineId: number, stateId: number) {
        // for the simulator
        const state: any = mmachine.getState(machineId, stateId)
        const descList = _simuLastDescriptionListUML(-1)
        if (0 < descList.length) {
            state["stateDesc"] = (
                (state["stateDesc"] ? state["stateDesc"] : []) as string[]
            ).concat(descList)
        }
    }

    /**
     * (internal) UML, transition
     * @param machineId machine id
     * @param stateId state id
     */
    //% shim=shimfake::simuTransitionUml
    export function _simuTransitionUml(machineId: number, stateId: number) {
        // for the simulator
        const state = mmachine.getState(machineId, stateId)
        const stateTransition = state.stateTransitionList[(state.stateTransitionList.length - 1)]
        const stateTransitionObj: any = stateTransition
        stateTransitionObj["targetDescList"] = _simuLastDescriptionListUML(stateTransition.targetIdList.length)
    }

    /**
     * (internal) UML, description
     * @param aDescription description
     */
    //% shim=shimfake::simuDescriptionUml
    export function _simuDescriptionUml(aDescription: string) {
        // for the simulator
        _lastDescriptionList.push(aDescription)
    }

    /**
     * (internal) UML, export
     * @param aStateMachine StateMachines
     * @param aStateName default state name
     * @param aMode 00b:json, 01b:state-diagram, 10b:trigger table, 11b:(both)
     */
    //% shim=shimfake::simuExportUml
    export function _simuExportUml(aStateMachine: StateMachines, aStateName: string, aMode: ModeExportUML) {
        // for the simulator
        const _doc = console.log
        const outputJson = 0 == (aMode & 3)
        const outputTriggerTable = 0 != (aMode & 2)
        const outputStateDiagram = 0 != (aMode & 1)

        type MbState = { state: { name: string, desc: string }, isFinalState?: boolean, isChoice?: boolean }
        type MbTrigger = { trigger: { name: string, desc: string }, isCompletion?: boolean }
        type MbTransition = { transition: { source: MbState, target: MbState, trigger: MbTrigger, guard: string, effect: string }, isDesc: boolean }
        type MbStateMachine = { states: MbState[], triggers: MbTrigger[], transitions: MbTransition[] }
        const compareNameMbState = (a1: MbState, a2: MbState) => {
            let ret: number = 0
            if (a1.isFinalState) {
                ret = 1
            } else if (a2.isFinalState) {
                ret = -1
            } else {
                const name1 = a1.state.name.toUpperCase()
                const name2 = a2.state.name.toUpperCase()
                if (name1 > name2) {
                    ret = 1
                } else if (name1 < name2) {
                    ret = -1
                }
            }
            return ret
        }
        const compareNameMbTrigger = (a1: MbTrigger, a2: MbTrigger) => {
            let ret: number = 0
            if (a1.isCompletion) {
                ret = -1
            } else if (a2.isCompletion) {
                ret = 1
            } else {
                const name1 = a1.trigger.name.toUpperCase()
                const name2 = a2.trigger.name.toUpperCase()
                if (name1 > name2) {
                    ret = 1
                } else if (name1 < name2) {
                    ret = -1
                }
            }
            return ret
        }

        // statemachine json
        const mb: MbStateMachine = { states: [], triggers: [], transitions: [] }

        // state - initial/final
        mb.states.push({ state: { name: "", desc: "(initial/final)" }, isFinalState: true })
        // trigger - completion transition
        mb.triggers.push({ trigger: { name: "", desc: "(completion transition)" }, isCompletion: true })
        // build states and triggers
        for (const state of mmachine.getStateMachine(aStateMachine)._stateList) {
            const stateObj = state as any

            // state
            const stateName = mstate._simuConvName(state.stateId)
            let objState = mb.states.find((value) => { return stateName == value.state.name })
            if (!objState) {
                const stateDesc = ((stateObj["stateDesc"] ? stateObj["stateDesc"] : []) as string[]).join("\\n")
                objState = { state: { name: stateName, desc: stateDesc } }
                if (("" == stateDesc)
                    && (0 == state.doActivityList.length)
                    && (0 < state.stateTransitionList.length)
                ) {
                    const t = state.stateTransitionList.find((item) => {
                        if (mmachine.namestore.NONE_ID != item.triggerId) {
                            return true
                        }
                        const selfTarget = item.targetIdList.find((value) => state.stateId == value)
                        if (selfTarget) {
                            return true
                        }
                        return false
                    })
                    if (!t) {
                        let targetCount = 0
                        for (const stateTransition of state.stateTransitionList) {
                            targetCount += stateTransition.targetIdList.length
                        }
                        if (1 < targetCount) {
                            // <<choice>>
                            objState.isChoice = true
                        }
                    }
                }
                mb.states.push(objState)
            }

            // state transition
            for (const stateTransition of state.stateTransitionList) {
                if (mmachine.namestore.SYS_START_TRIGGER_ID == stateTransition.triggerId) {
                    // for StarterTransition
                    continue
                }
                // trigger
                const triggerName = mstate._simuConvName(stateTransition.triggerId)
                let objTrigger = mb.triggers.find((value) => { return triggerName == value.trigger.name })
                if (!objTrigger) {
                    objTrigger = { trigger: { name: triggerName, desc: "" } }
                    mb.triggers.push(objTrigger)
                }
            }
        }
        // build transitions
        for (const state of mmachine.getStateMachine(aStateMachine)._stateList) {

            // state
            const stateName = mstate._simuConvName(state.stateId)
            const source = mb.states.find((value) => { return stateName == value.state.name })

            // stateTransition
            for (const stateTransition of state.stateTransitionList) {
                const stateTransitionObj = stateTransition as any

                // trigger
                const triggerName = mstate._simuConvName(stateTransition.triggerId)
                const trigger = mb.triggers.find((value) => { return triggerName == value.trigger.name })

                // state transition
                const targetDescList: string[] = stateTransitionObj["targetDescList"] ? stateTransitionObj["targetDescList"] : []
                stateTransition.targetIdList.forEach((targetId, index) => {
                    // transition
                    const targetName = mstate._simuConvName(targetId)
                    let target = mb.states.find((value) => { return targetName == value.state.name })
                    if (!target) {
                        target = { state: { name: targetName, desc: "" } }
                        mb.states.push(target)
                    }
                    let guard = ""
                    let effect = ""
                    let isDesc = false
                    let s = targetDescList[index]
                    if (s) {
                        if (":" == s.charAt(0)) {
                            isDesc = true
                            s = s.slice(1)
                        }
                        const a = s.split("/", 2)
                        if (a[0]) {
                            guard = a[0].trim()
                        }
                        if (a[1]) {
                            effect = a[1].trim()
                        }
                    }
                    mb.transitions.push({ transition: { source, target, trigger, guard, effect }, isDesc })
                })
            }
        }
        // validate <<choise>>
        for (const stateItem of mb.states) {
            if (stateItem.isChoice) {
                const t = mb.transitions.find(item => stateItem == item.transition.target)
                if (!t) {
                    // no targets
                    stateItem.isChoice = false
                }
            }
        }
        // sort
        mb.states.sort(compareNameMbState)
        mb.triggers.sort(compareNameMbTrigger)

        if (outputJson) {
            // startjson/endjson
            _doc("''''''''''''''''''''''''''")
            _doc("@startjson")
            _doc("' ")
            _doc("' PlantUML Web server:")
            _doc("' https://www.plantuml.com/plantuml/")
            _doc("' ")
            _doc("' Display JSON Data - https://plantuml.com/json")
            _doc("' >>>>> JSON")

            // JSON
            const stringifyJSON = (value: any, maxStringLength = 240): string[] => {
                const result: string[] = []
                const a = JSON.stringify(value, null, 1).split("\n")
                a[a.length - 1] = " " + a[a.length - 1]
                let buff: string = ""
                a.forEach((value) => {
                    if (maxStringLength < buff.length + value.length) {
                        result.push(buff)
                        buff = ""
                    }
                    buff = buff + value
                })
                if (0 < buff.length) {
                    result.push(buff)
                }
                return result
            }
            stringifyJSON(mb).forEach((s) => _doc(s))

            _doc("' <<<<< JSON")
            _doc("' ")
            _doc("' generator: https://github.com/jp-rad/pxt-mstate")
            _doc("' ")
            _doc("' PlantUML Web server:")
            _doc("' https://www.plantuml.com/plantuml/")
            _doc("' ")
            _doc("@endjson")
        }

        if (outputStateDiagram || outputTriggerTable) {
            // startuml/enduml
            _doc("''''''''''''''''''''''''''")
            _doc("@startuml")
            _doc("' ")
            _doc("' PlantUML Web server:")
            _doc("' https://www.plantuml.com/plantuml/")
            _doc("' ")
            _doc("' State Diagram - https://plantuml.com/state-diagram")
        }
        if (outputStateDiagram) {
            // statemachine
            _doc("state __M" + aStateMachine + "__ {")

            // states <<choise>>
            for (const stateItem of mb.states) {
                if (stateItem.isChoice) {
                    _doc("state " + stateItem.state.name + " <<choice>>")
                }
            }

            // start
            _doc("[*] -> " + aStateName + " : <<start>>")

            // states
            for (const stateItem of mb.states) {
                if (stateItem.isFinalState) {
                    continue
                }
                // state
                const state = stateItem.state
                if (!stateItem.isChoice) {
                    _doc("state " + state.name + (state.desc ? " : " + state.desc : ""))
                }

                // transitions
                const transList = mb.transitions.filter(value => (state.name == value.transition.source.state.name))
                for (const transItem of transList) {
                    // transition
                    const transition = transItem.transition
                    const targetName = transition.target.state.name ? transition.target.state.name : "[*]"
                    let attrPart = ((transition.guard ? " [ " + transition.guard + " ] " : "")
                        + (transition.effect ? " / " + transition.effect : "")).trim()
                    attrPart = (transition.trigger.trigger.name + " " + attrPart).trim()
                    if (attrPart) {
                        attrPart = " : " + attrPart
                    }
                    if ((transItem.isDesc) && (!stateItem.isChoice)) {
                        _doc("state " + transition.source.state.name + " : --> " + targetName + attrPart)
                    } else {
                        const arrowMarkup = transition.target.state.name ? " --> " : "  -> "
                        _doc(transition.source.state.name + arrowMarkup + targetName + attrPart)
                    }
                }
            }

            _doc("}") // statemachine

            _doc("' ")
            _doc("' generator: https://github.com/jp-rad/pxt-mstate")
            _doc("' ")
            _doc("' PlantUML Web server:")
            _doc("' https://www.plantuml.com/plantuml/")
            _doc("' ")

        }

        if (outputTriggerTable) {
            // trigger table
            _doc("json M" + aStateMachine + " {")
            // build json table rows
            type TbRow = { key: string, value: any[] }
            const headerKeyTrigger = "**trigger**"
            const headerKeySource = "**source**"
            const headerValue = [{ "": ["**[guard] / effect**", "**target**"] }]
            const tbl: TbRow[] = []
            {
                function tbAddRow(key: string) {
                    const sources: any = {}
                    sources[headerKeySource] = headerValue  // header
                    for (const state of mb.states) {
                        if (state.isFinalState) {
                            continue
                        }
                        const sourceName = (state.isChoice ? "<<choice>>\\n" : "") + state.state.name
                        sources[sourceName] = []
                    }
                    tbl.push({ key, value: [sources] })
                }
                const completionTriggerName = "(__completion__)"
                for (const triggerItem of mb.triggers) {
                    // trigger
                    const triggerName = triggerItem.isCompletion ? completionTriggerName : triggerItem.trigger.name
                    tbAddRow(triggerName)
                }
                // transitions
                for (const transItem of mb.transitions) {
                    // transition
                    const transition = transItem.transition
                    const triggerName = transition.trigger.isCompletion ? completionTriggerName : transition.trigger.trigger.name
                    const tbRow = tbl.find(value => triggerName == value.key)
                    const sourceName = (transition.source.isChoice ? "<<choice>>\\n" : "") + transition.source.state.name
                    const stateChildren: any[] = tbRow.value[0][sourceName]
                    const attrPart = ((transition.guard ? " [ " + transition.guard + " ] " : "")
                        + (transition.effect ? " / " + transition.effect : "")).trim()
                    const targetName = (transition.target.isChoice ? "<<choice>>\\n" : "") + transition.target.state.name || "[__FinalState__]"
                    const child = { "": [attrPart, targetName] }
                    stateChildren.push(child)
                }
            }
            // output header
            _doc('"' + headerKeyTrigger + '" : ["**transitions**"] ,')
            // output rows
            for (const tbRow of tbl) {
                _doc('"' + tbRow.key + '" : ' + JSON.stringify(tbRow.value) + " ,")
            }
            // output defalut row
            _doc('"**__default__**" : ["' + aStateName + '"]')
            _doc("}") // trigger table

            _doc("' ")
            _doc("' generator: https://github.com/jp-rad/pxt-mstate")
            _doc("' ")
            _doc("' PlantUML Web server:")
            _doc("' https://www.plantuml.com/plantuml/")
            _doc("' ")

        }
        if (outputStateDiagram || outputTriggerTable) {
            // startuml/enduml
            _doc("@enduml")
        }
    }

}
