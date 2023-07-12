const GENERIC_INFORMATION_TYPES = [
  {"title": "Hardware", "key": "hw_ver"},
  {"title": "Software", "key": "sw_ver"},
  {"title": "MAC", "key": "mac"},
  {"title": "Model", "key": "model"},
  {"title": "Mic Type", "key": "mic_type"},
  {"title": "Hardware ID", "key": "hwId"},
  {"title": "Longitude", "key": "longitude_i"},
  {"title": "Latitude", "key": "latitude_i"},
  {"title": "Is On", "key": "is_on"}
]

window.onload = async function() {
  // keep fetching until successful
  let data
  let k = 0
  let success = true
  while (1) {
    const a = await fetch("/devices")
    const b = await a.json()

    if (b.success) {data = b; break}
    await new Promise(r => setTimeout(r, 500))
    k += 1
    if (k == 120) {
      document.getElementById("loading").innerHTML = "Client failed to respond, refresh to try again"
      success = false
      break
    }
  }
  if (success) {
    document.getElementById("loading").remove()
    const commandLine = document.getElementById("commandLineArgument")
    const feedback = document.getElementById("feedback")
    
    setInterval(async function() {
      const a = await fetch("/updated")
      const b = await a.json()
      document.getElementById("lastUpdated").innerHTML = "Last ping "+b.last_updated+" seconds ago"
      console.log(b.acked)
      if (b.acked != 0) {
        feedback.style.color = "green"
        feedback.innerHTML = `Client ran ${b.acked} command(s)`
      }
    }, 5000)

    commandLine.addEventListener("change", function(e) {
      fetch("/command", {
        method: "POST",
        body: JSON.stringify({
          command: commandLine.value
        })
      })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            feedback.style.color = "#ffffff"
            feedback.innerHTML = `Successfully sent command '${commandLine.value}' to client, awaiting response...`
          }
        })
    })
  
    // render each devices
    let i = 0
    const selectionContainer = document.getElementById("selectionContainer")
    data.data.forEach(function(dev) {
      const device = document.createElement("div")
      const deviceTitle = document.createElement("div")
      const deviceDetailRow1 = document.createElement("div")
      const deviceDetailRow2 = document.createElement("div")
  
      device.className = "selection"
      deviceTitle.className = "selection-title"
      deviceDetailRow1.className = "detail-row centered-vertically"
      deviceDetailRow2.className = "detail-row centered-vertically"
  
      deviceTitle.innerHTML = `${dev.alias} (${dev.dev_name})`
  
      const deviceDetailRow1Sub = document.createElement("div")
      const deviceDetailRow1Value = document.createElement("div")
      const deviceDetailRow2Sub = document.createElement("div")
      const deviceDetailRow2Value = document.createElement("div")
  
      deviceDetailRow1Sub.className = "detail-sub"
      deviceDetailRow1Value.className = "detail-value"
      deviceDetailRow2Sub.className = "detail-sub"
      deviceDetailRow2Value.className = "detail-value"
  
      deviceDetailRow1Sub.innerHTML = "Host: "
      deviceDetailRow1Value.innerHTML = dev.host
      deviceDetailRow2Sub.innerHTML = "Device ID: "
      deviceDetailRow2Value.innerHTML = dev.deviceId
  
      deviceDetailRow1.append(deviceDetailRow1Sub, deviceDetailRow1Value)
      deviceDetailRow2.append(deviceDetailRow2Sub, deviceDetailRow2Value)
  
      const deviceDetailsWrapper = document.createElement("div")
      deviceDetailsWrapper.id = `gI${i}`
      deviceDetailsWrapper.style.display = "none"
  
      const deviceGenericInformation1 = document.createElement("div")
      const deviceGenericInformation2 = document.createElement("div")
  
      deviceGenericInformation1.className = "generic-information"
      deviceGenericInformation2.className = "generic-information"
  
      GENERIC_INFORMATION_TYPES.forEach(function(type) {
        const typeTitle = document.createElement("div")
        const typeValue = document.createElement("div")
  
        typeTitle.innerHTML = type.title
        typeValue.innerHTML = dev[type.key]
        typeValue.className = "detail-value"
        deviceGenericInformation1.append(typeTitle, typeValue)
      })
  
      const j = i
      const showMoreButton = document.createElement("div")
      showMoreButton.className = "show-more-button"
      showMoreButton.id = j
      showMoreButton.onclick = function() {let e = document.getElementById('gI'+this.id); if (e.style.display == 'none') {e.style.display = ''; this.innerHTML = 'Show less'} else {e.style.display = 'none'; this.innerHTML = 'Show more'}}
      showMoreButton.innerHTML = "Show more"
      
      deviceDetailsWrapper.append(deviceGenericInformation1, deviceGenericInformation2)
      device.append(deviceTitle, deviceDetailRow1, deviceDetailRow2, deviceDetailsWrapper, showMoreButton)
      selectionContainer.append(device)
      i += 1
    })
  }
}
