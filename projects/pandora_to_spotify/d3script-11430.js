async function singleArtistGraph() {

    // 1. Access data (Write Accessor functions)
    // 2. Create chart dimensions
    // 3. Draw canvas
    // 4. Create scales
    // 5. Draw data
    // 6. Draw peripherals
    // 7. Set up interactions

    const visID = "11430"
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

    // const dataset = await d3.json("./data/mumford_related_artists_1.json")
    const dataset = await d3.json("/data-viz/pandora-to-spotify/data/mumford_related_artists_1.json")
    const childAccessor = d => d.related_artists
    let root = d3.hierarchy(dataset, d => childAccessor(d))
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
        const widthLarge = 1440
        const heightLarge = 500
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
                <span>Mumford & Sons Related Artists</span>
             </div>
             <div id="${descriptionTextID}" class="description-text">
                <span>
                All of the artists that are commonly associated to Mumford 
                based on Spotify user listening habits.
                </span>
             </div>`

        const sourceHTML =
            `<div id="${sourceTextID}" class="source-text">
                <span>
                This chart was built on top of data from the Spotify API. Click 
                <a href="https://developer.spotify.com/documentation/web-api/reference/#/operations/get-an-artists-
                related-artists" target="_blank">here</a> to see how.
                </span>
             </div>`
        const wrapper = d3.select(`#${d3DivID}`)
            .style("max-width", widthLarge + "px")
            .style("min-width", widthSmall + "px")
            .style("left", `calc(50% - ${dimensions.width}px/2)`)
            .html(customHTML)
            .append("svg")
            .attr("overflow", "visible")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .attr("fill", "none")

        d3.select(`#${d3DivID}`).append("div")
            .html(sourceHTML)

        d3.selectAll(`#${titleTextID}, #${descriptionTextID}, #${sourceTextID}`)
            .style("margin-left", `${dimensions.margin.left}px`)
            .style("margin-right", `${dimensions.margin.right}px`)

        const def = wrapper.append("defs")

        const chart = wrapper.append("g")
            .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

        const cluster = d3.cluster()
            .size([dimensions.boundedWidth, dimensions.boundedHeight])

        cluster(root)
        root.x = 0.10 * dimensions.boundedWidth
        const maxDepth  = d3.max(root.leaves(), d => d.depth)

        const links = chart.selectAll("path")
            .data(root.links())
            .join("path")
            .attr("d", d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y))
            .attr("fill", "none")
            .attr("stroke", "rgba(0, 0, 0, 0.2)")

        def.selectAll(".artist-background-image-" + visID)
            .data(root)
            .join("pattern")
                .attr("class", "artist-background-image-" + visID)
                .attr("id", d => d.data.id + "-" + visID)
                .attr("height", "100%")
                .attr("width", "100%")
                .attr("patternContentUnits", "objectBoundingBox")
                .append("image")
                    .attr("height", 1)
                    .attr("width", 1)
                    .attr("preserveAspectRatio", "none")
                    .attr("xlink:href", d => d.data.image_url)

        const dots = chart.selectAll("circle")
            .data(root)
            .join("circle")
                .attr("fill", d => "url(#" + d.data.id + "-" + visID + ")")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", function(d) {
                    let circleRadius = 20
                    if (d.depth === 0) {
                        circleRadius = 40
                    } else if (d.depth === 1) {
                        circleRadius = 30
                    }
                    d.radius = circleRadius
                    return circleRadius
                })
                .attr("class", "artist-circles-" + visID)

        chart.selectAll(".artist-circles-" + visID)
            .on("mouseenter", onMouseEnter)
            .on("mouseleave", onMouseLeave)

        const tooltip = d3.select(`#${tooltipID}`)
        const tooltipRect = tooltip.node().getBoundingClientRect()
        const tooltipWidth = tooltipRect.width
        const tooltipHeight = tooltipRect.height
        const tooltipXScale = d3.scaleLinear()
            .domain([0, dimensions.boundedWidth])
            .range([1/2 * tooltipWidth, -1/2 * tooltipWidth])
        const headerSize = wrapper.node().getBoundingClientRect().y -
            d3.select(`#${d3DivID}`).node().getBoundingClientRect().y

        function onMouseEnter(event, datum) {
            tooltip.select(`#${tooltipArtistNameID}`)
                .text(datum.data.name)
            tooltip.select(`#${tooltipArtistImageID}`)
                .attr("src", datum.data.image_url)

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
                yOffset = tooltipYBuffer + datum.radius + tooltipHeight/2
            } else {
                yOffset = -tooltipYBuffer - datum.radius - tooltipHeight/2
            }

            const xOffset = tooltipXScale(datum.x)

            tooltipY += yOffset
            tooltipX += xOffset

            tooltip.style("transform", `translate(${tooltipX}px, ${tooltipY}px)`)
            tooltip.style("opacity", 1)
        }

        function onMouseLeave(event, datum) {
            tooltip.style("opacity", 0)
        }

    }

}

singleArtistGraph()