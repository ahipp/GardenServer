/**
 *  Raspberry Pi Gardenserver Interface
 *
 *  Copyright 2017 Adam Hipp
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
metadata {
	definition (name: "Raspberry Pi Gardenserver Interface", namespace: "ahipp", author: "Adam Hipp") {
    	attribute "internalSwitch", "string"
        attribute "soilTemp", "string"
        command "turnOn"
        command "turnOff"
	}

	simulator {
		// TODO: define status and reply messages here
	}

	tiles(scale: 2) {        
        standardTile("automatedControlTile", "device.internalSwitch", width: 2, height: 2) {
            state "off", label:'Off', icon:"st.switches.switch.off", backgroundColor:"#ffffff"
            state "on", label:'On', icon:"st.switches.switch.on", backgroundColor:"#390172"
        } 
        
        standardTile("turnOnTile", "device.turnOn", inactiveLabel: false, decoration: "flat", width: 2, height: 2) {
        	state "default", action:"turnOn", label: "Turn On", displayName: "Turn On"
		}
        
        standardTile("turnOffTile", "device.turnOff", inactiveLabel: false, decoration: "flat", width: 2, height: 2) {
        	state "default", action:"turnOff", label: "Turn Off", displayName: "Turn Off"
		}
        
        valueTile("soilTemp", "device.soilTemp", decoration: "flat", width: 2, height: 2) {
        	state "soilTemp", label:'${currentValue}', unit: "F"
        }
        
        main("automatedControlTile")
        details(["automatedControlTile","turnOnTile","turnOffTile","soilTemp"])
    }       

}

def installed() {
	log.debug "installed"
}

// parse events into attributes
def parse(String description) {
    log.debug "parse description: $description"

    def attrName = null
    def attrValue = null

    if (description?.startsWith("on/off:")) {
        log.debug "switch command"
        attrName = "switch"
        attrValue = description?.endsWith("1") ? "on" : "off"
    }

    def result = createEvent(name: attrName, value: attrValue)

    log.debug "Parse returned ${result?.descriptionText}"
    return result
}

def getSoilTemp(data) {
	log.debug "getSoilTemp $data"
	sendEvent(name: "soilTemp", value: "$data")
}

def turnOff() {
	log.debug "turnOff()"
    getSoilTemp("75")
	sendEvent(name: "internalSwitch", value: "off")	
}

def turnOn() {
	log.debug "turnOn()"
    getSoilTemp("70")
	sendEvent(name: "internalSwitch", value: "on")	
}

def on() {
	log.debug "on()"
}

def off() {
	log.debug "off()"
}

