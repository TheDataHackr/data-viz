async function spectralSpiralGraph() {

    const visID = "10372"
    const d3DivID = "data-viz-" + visID
    const titleTextID = "title-text-" + visID
    const descriptionTextID = "description-text-" + visID
    const sourceTextID = "source-text-" + visID
    const tooltipID = "tooltip-" + visID
    const tooltipClass = "tooltip-" + visID
    const tooltipArtistNameClass = "tooltip-artist-name-" + visID
    const tooltipArtistImageID = "tooltip-artist-image-" + visID
    const artistImageDivID = "artist-image-div-" + visID
    const tooltipArtistNameID = "tooltip-artist-name-" + visID

    const url = window.location.href
    let dataFile = ""
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
        dataFile = "./data/spectral_data.json"
    } else {
        dataFile = "/data-viz/pandora-to-spotify/data/spectral_data.json"
    }

    const dataset = await d3.json(dataFile)

    drawChart()

    let timeoutFunc
    window.onresize = function() {
        clearTimeout(timeoutFunc)
        timeoutFunc = setTimeout(function() {
            drawChart()
        }, 200)
    }

    function drawChart () {
        d3.select(`#${d3DivID}`).selectAll("svg").remove()

        // For a full screen image Large should be 1440x1024 and Small should be 320x640
        const widthLarge = 1000
        const heightLarge = 1000
        const widthSmall = 320
        const heightSmall = 500

        let width = d3.select(`#${d3DivID}`).node().getBoundingClientRect().width
        width = d3.max([widthSmall, d3.min([width, widthLarge])])


        const height = heightLarge - (widthLarge - width) * ((heightLarge - heightSmall)/(widthLarge - widthSmall))
        const hMarginLarge = 0.06
        const hMarginSmall = 0.06
        const hMarginRange = hMarginLarge - hMarginSmall
        const hMarginPct = (1.0 - (widthLarge - width)/(widthLarge - widthSmall)) * hMarginRange + hMarginSmall

        let dimensions = {
            width: width,
            height: height,
            margin: {
                top: 0.15 * height,
                bottom: 0.1 * height,
                left: hMarginPct * width,
                right: hMarginPct * width,
            }
        }
        dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
        dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

        const description = "This chart shows the closest 100 artists to Mumford & Sons measured by the" +
            " Euclidean distance from each artist to Mumford based on a spectral clustering layout. Artists closer" +
            " to the center indicate a stronger similarity than those further away."

        const customHTML =
            `<div id="${tooltipID}" class="${tooltipClass}">
                  <div id="${artistImageDivID}">
                      <img id="${tooltipArtistImageID}" src="" alt="">
                  </div>
                  <div class="${tooltipArtistNameClass}">
                      <span id="${tooltipArtistNameID}"></span>
                  </div>
             </div>
             
             <div id="${titleTextID}" class="title-text">
                <span>Spectral Clustering Proximity</span>
             </div>
             <div id="${descriptionTextID}" class="description-text">
                <span>
                ${description}
                </span>
             </div>`

        const sourceHTML =
            `<div id="${sourceTextID}" class="source-text">
                <span>
                This chart was built on top of data from the Spotify API. Click 
                <a href="https://developer.spotify.com/documentation/web-api/" target="_blank">here</a> to see how.
                </span>
             </div>`
        const wrapper = d3.select(`#${d3DivID}`)
            .style("max-width", widthLarge + "px")
            .style("min-width", widthSmall + "px")
            .style("left", `calc(50% - ${dimensions.width}px/2)`)
            .html(customHTML)
            .append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .attr("fill", "none")

        d3.select(`#${d3DivID}`).append("div")
            .html(sourceHTML)

        d3.selectAll(`#${titleTextID}, #${descriptionTextID}, #${sourceTextID}`)
            .style("margin-left", `${dimensions.margin.left}px`)
            .style("margin-right", `${dimensions.margin.right}px`)

        const def = wrapper.append("defs")

        def.selectAll(".artist-background-image-" + visID)
            .data(dataset)
            .join("pattern")
                .attr("class", "artist-background-image-" + visID)
                .attr("id", d => d.id + "-" + visID)
                .attr("height", "100%")
                .attr("width", "100%")
                .attr("patternContentUnits", "objectBoundingBox")
                .append("image")
                    .attr("height", 1)
                    .attr("width", 1)
                    .attr("preserveAspectRatio", "none")
                    .attr("xlink:href", d => d.image_url)

        const chart = wrapper.append("g")
            .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

        // Chart specific code starts here
        const centerX = dimensions.boundedWidth/2
        const centerY = dimensions.boundedHeight/2

        const maxRadius = 0.95 * d3.min([dimensions.boundedWidth/2, dimensions.boundedHeight/2])
        const nodeRadius = maxRadius/14
        const radiusScale = d3.scaleLinear()
            .domain(d3.extent(dataset, d => d.distance))
            .range([maxRadius/8, maxRadius])

        const angleScale = d3.scaleLinear()
            .domain(d3.extent(dataset, d => d.order))
            .range([0, 7 * Math.PI])

        // Loop through to set the radius for each node
        dataset.forEach(function (d) {
            d.x = centerX + (d.order === 0 ? 0: radiusScale(d.distance)) * Math.cos(angleScale(d.order))
            d.y = centerY + (d.order === 0 ? 0: radiusScale(d.distance)) * Math.sin(angleScale(d.order))
        })

        const nodes = chart.selectAll(".nodes-" + visID)
            .data(dataset).enter()
            .append("circle")
            .attr("fill", d => "url(#" + d.id + "-" + visID + ")")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.order === 0 ? maxRadius/7: nodeRadius)
            .attr("class", "nodes-" + visID)
            // .attr("class", d => d.id === "center" ? "center-node-" + visID: "genre-nodes-" + visID)
            // .attr("id", d => "genre-node-" + d.id.replace(/[^a-zA-Z0-9]/g, '-') + "-" + visID)

        chart.selectAll(".nodes-" + visID)
            .on("mouseenter", onMouseEnter)
            .on("mouseleave", onMouseLeave)

        const headerSize = wrapper.node().getBoundingClientRect().y -
            d3.select(`#${d3DivID}`).node().getBoundingClientRect().y

        const tooltip = d3.select(`#${tooltipID}`)
        const tooltipRect = tooltip.node().getBoundingClientRect()
        const tooltipWidth = tooltipRect.width
        const tooltipHeight = tooltipRect.height
        const tooltipXScale = d3.scaleLinear()
            .domain([0, dimensions.boundedWidth])
            .range([1/2 * tooltipWidth, -1/2 * tooltipWidth])

        tooltip.style("transform", `translate(0px, -${tooltipHeight}px)`)

        function onMouseEnter(event, datum) {


            tooltip.select(`#${tooltipArtistNameID}`)
                .text(datum.name)
            tooltip.select(`#${tooltipArtistImageID}`)
                .attr("src", datum.image_url)

            // This would position the tooltip right where the mouse is.
            // const divBoundingRect = d3.select(`#${d3DivID}`).node().getBoundingClientRect()
            // const viewportX = divBoundingRect.x
            // const viewportY = divBoundingRect.y
            // const tooltipX = datum.x - viewportX
            // const tooltipY = datum.y - viewportY

            const tooltipYBuffer = 10

            let tooltipX = datum.x + dimensions.margin.left - tooltipWidth/2
            let tooltipY = datum.y + dimensions.margin.top + headerSize - tooltipHeight/2

            let yOffset = 0
            if (datum.y <= dimensions.boundedHeight/2) {
                // Tooltip below the data point
                yOffset = tooltipYBuffer + nodeRadius + tooltipHeight/2
            } else {
                yOffset = -tooltipYBuffer - nodeRadius - tooltipHeight/2
            }

            const xOffset = tooltipXScale(datum.x)

            tooltipY += yOffset
            tooltipX += xOffset

            tooltip.style("transform", `translate(${tooltipX}px, ${tooltipY}px)`)
            tooltip.style("opacity", 1)
        }

        function onMouseLeave(event, datum) {
            tooltip.style("opacity", 0)
            tooltip.style("transform", `translate(0px, -${tooltipHeight}px)`)
        }
    }

}

spectralSpiralGraph()