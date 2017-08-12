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
 
preferences {
        input("ip", "string", title:"IP Address", description: "192.168.1.150", defaultValue: "192.168.1.150", required: true, displayDuringSetup: true)
        input("port", "string", title:"Port", description: "8000", defaultValue: 8000, required: true, displayDuringSetup: true)
}

metadata {
	definition (name: "Raspberry Pi Gardenserver Interface", namespace: "ahipp", author: "Adam Hipp") {
        attribute "soilTemp", "string"
        attribute "coilSwitch", "string"
        attribute "fishTankSwitch", "string"
        command "turnOnCoil"
        command "turnOffCoil"
        command "turnOnFishTank"
        command "turnOffFishTank"
	}

	simulator {
		// TODO: define status and reply messages here
	}

	tiles(scale: 2) {        
        standardTile("coilSwitch", "device.coilSwitch", inactiveLabel: false, decoration: "flat", width: 2, height: 2) {
        	state "off", action:"turnOnCoil", label: "Turn On Coil", displayName: "Turn On Coil", icon:"st.switches.switch.off", backgroundColor: "#ffffff"
            state "on", action:"turnOffCoil", label: "Turn Off Coil", displayName: "Turn Off Coil", icon:"st.switches.switch.on", backgroundColor: "#009900"
		}
        
        standardTile("fishTankSwitch", "device.fishTankSwitch", inactiveLabel: false, decoration: "flat", width: 2, height: 2) {
        	state "off", action:"turnOnFishTank", label: "Turn On Fish Tank", displayName: "Turn On Fish Tank", icon:"st.switches.switch.off", backgroundColor: "#ffffff"
            state "on", action:"turnOffFishTank", label: "Turn Off Fish Tank", displayName: "Turn Off Fish Tank", icon:"st.switches.switch.on", backgroundColor: "#009900"
		}
        
        valueTile("soilTemp", "device.soilTemp", decoration: "flat", width: 2, height: 2) {
        	state "soilTemp", label:'${currentValue}', unit: "F"
        }
        
        main("soilTemp")
        details(["coilSwitch","fishTankSwitch","soilTemp"])
    }       
}

def installed() {
	log.debug "installed"
}

def updated() {
	log.debug "updated"
    getSoilTemp()
}

def initialize() {
	log.debug "initialize"
    runEvery1Minute(getSoilTemp)
}

def parse(String description) {
    log.debug "parse description: $description"
}

def getSoilTemp() {
	log.debug "getSoilTemp"
    def uri = "/getTemperature"
    def body = [sensorName: "tempSensor1"]
	getAction(uri, body)
}

def turnOffCoil() {
	log.debug "turnOffCoil()"
    def uri = "/issueCommand"
    def body = [command: "soilCoilHeaterOff"]
    postAction(uri, body)
}

def turnOnCoil() {
	log.debug "turnOnCoil()"
    def uri = "/issueCommand"
    def body = [command: "soilCoilHeaterOn"]
    postAction(uri, body) 
}

def turnOffFishTank() {
	log.debug "turnOffFishTank()"
    def uri = "/issueCommand"
    def body = [command: "fishTankHeaterOff"]
    postAction(uri, body)
}

def turnOnFishTank() {
	log.debug "turnOnFishTank()"
    def uri = "/issueCommand"
    def body = [command: "fishTankHeaterOn"]
    postAction(uri, body) 
}

private getAction(uri, body) {
  setDeviceNetworkId(ip,port)  
  
  def hubAction = new physicalgraph.device.HubAction(
    [
    method: "GET",
    path: uri,
    body: body
    ],
    device.deviceNetworkId,
    [callback: "getCallbackHandler"]
  )
  
  log.debug("Executing hubAction on " + getHostAddress())
  hubAction 
}

private getCallbackHandler(physicalgraph.device.HubResponse hubResponse) {
	log.debug "$hubResponse.body"
    sendEvent(name: "soilTemp", value: hubResponse.body.take(4))
}

private postAction(uri, body){
  setDeviceNetworkId(ip,port)  
  
  def hubAction = new physicalgraph.device.HubAction(
    [
    method: "POST",
    path: uri,
    body: body
    ],
    device.deviceNetworkId,
    [callback: "postCallbackHandler"]
  )
  
  log.debug("Executing hubAction on " + getHostAddress())
  hubAction   
}

private postCallbackHandler(physicalgraph.device.HubResponse hubResponse) {
    if (hubResponse.body.equalsIgnoreCase(/"soilCoilHeaterOff issued"/)) {
    	log.debug "coilSwitch off event"
    	sendEvent(name: "coilSwitch", value: "off")
    } else if (hubResponse.body == /"soilCoilHeaterOn issued"/) {
    	log.debug "coilSwitch on event" 
    	sendEvent(name: "coilSwitch", value: "on")
    } else if (hubResponse.body.equalsIgnoreCase(/"fishTankHeaterOff issued"/)) {
    	log.debug "fishTankSwitch off event"
    	sendEvent(name: "fishTankSwitch", value: "off")
    } else if (hubResponse.body == /"fishTankHeaterOn issued"/) {
    	log.debug "fishTankSwitch on event" 
    	sendEvent(name: "fishTankSwitch", value: "on")
    }
}

private setDeviceNetworkId(ip,port){
  	def iphex = convertIPtoHex(ip)
  	def porthex = convertPortToHex(port)
  	device.deviceNetworkId = "$iphex:$porthex"
  	log.debug "Device Network Id set to ${iphex}:${porthex}"
}

private getHostAddress() {
	return "${ip}:${port}"
}

private String convertIPtoHex(ipAddress) { 
    String hex = ipAddress.tokenize( '.' ).collect {  String.format( '%02x', it.toInteger() ) }.join()
    return hex
}

private String convertPortToHex(port) {
	String hexport = port.toString().format( '%04x', port.toInteger() )
    return hexport
}
