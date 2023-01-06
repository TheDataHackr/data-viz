async function genreRelationshipGraph() {

    const visID = "47797"
    const d3DivID = "data-viz-" + visID
    const titleTextID = "title-text-" + visID
    const descriptionTextID = "description-text-" + visID
    const sourceTextID = "source-text-" + visID
    const tooltipID = "tooltip-" + visID
    const tooltipClass = "tooltip-" + visID
    const clickedTooltipID = "clicked-tooltip-" + visID
    const clickedTooltipClass = "clicked-tooltip-" + visID
    const clickedTooltipTitle = "clicked-tooltip-title-" + visID
    const clickedTooltipArtistImageDiv = "artist-image-div-" + visID
    const clickedTooltipArtistImageID = "artist-image-" + visID
    const clickedTooltipArtistName = "artist-name-" + visID
    const genreCheckboxID = "genre-checkbox-" + visID
    const genreCheckboxDivID = "genre-checkbox-div-" + visID

    const tooltipGenreClass = "tooltip-genre-" + visID
    const tooltipGenreID = "tooltip-genre-" + visID

    let genreChecked = ""
    let afterFirstRun = false

    const url = window.location.href
    let smallDataFile = ""
    let largeDataFile = ""
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
        smallDataFile = "./data/genre_relationships_final_1K.json"
        largeDataFile = "./data/genre_relationships_final.json"
    } else {
        smallDataFile = "/data-viz/pandora-to-spotify/data/genre_relationships_final_1K.json"
        largeDataFile = "/data-viz/pandora-to-spotify/data/genre_relationships_final.json"
    }

    let dataset = await d3.json(smallDataFile)

    let simulation = d3.forceSimulation()

    drawChart()

    let timeoutFunc
    let currentWidth = window.innerWidth
    function resizeEvent() {
        const newWidth = window.innerWidth
        if (newWidth !== currentWidth) {
            currentWidth = newWidth
            clearTimeout(timeoutFunc)
            timeoutFunc = setTimeout(function() {
                drawChart()
            }, 500)
        }
    }

    window.addEventListener("resize", resizeEvent)

    function drawChart () {
        d3.select(`#${d3DivID}`).selectAll("svg").remove()

        // For a full screen image Large should be 1440x1024 and Small should be 320x640
        const widthLarge = 1440
        const heightLarge = 1024
        const widthSmall = 320
        const heightSmall = 640

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

        let description = ""
        if (genreChecked === "checked") {
            description = "Clustering all 5,762 genres based on how often a each genre shows up " +
                "with other genres for over 300,000 randomly selected artists. Hover to see all of " +
                "the connected genres and click to get more details."
        } else {
            description = "Clustering the top 1,000 genres based on how often a each genre shows up " +
                "with other genres for over 300,000 randomly selected artists. Hover to see all of " +
                "the connected genres and click to get more details."
        }

        const customHTML =
            `<div id="${tooltipID}" class="${tooltipClass}">
                  <div class="${tooltipGenreClass}">
                      <span id="${tooltipGenreID}"></span>
                  </div>
             </div>
             <div id="${clickedTooltipID}" class="${clickedTooltipClass}">
                  <div class="${clickedTooltipTitle}">
                      <span id="${tooltipGenreID}"></span>
                  </div>
                  <table>
                      <tr>
                          <td>
                              <div class="${clickedTooltipArtistImageDiv}">
                                  <img id="${clickedTooltipArtistImageID}-0" src="" alt="">
                              </div>
                          </td>
                          <td>
                              <div class="${clickedTooltipArtistName}">
                                  <span id="${clickedTooltipArtistName}-0"></span>
                              </div>
                          </td>
                      </tr>
                      <tr>
                          <td>
                              <div class="${clickedTooltipArtistImageDiv}">
                                  <img id="${clickedTooltipArtistImageID}-1" src="" alt="">
                              </div>
                          </td>
                          <td>
                              <div class="${clickedTooltipArtistName}">
                                  <span id="${clickedTooltipArtistName}-1"></span>
                              </div>
                          </td>
                      </tr>
                      <tr>
                          <td>
                              <div class="${clickedTooltipArtistImageDiv}">
                                  <img id="${clickedTooltipArtistImageID}-2" src="" alt="">
                              </div>
                          </td>
                          <td>
                              <div class="${clickedTooltipArtistName}">
                                  <span id="${clickedTooltipArtistName}-2"></span>
                              </div>
                          </td>
                      </tr>
                      <tr>
                          <td>
                              <div class="${clickedTooltipArtistImageDiv}">
                                  <img id="${clickedTooltipArtistImageID}-3" src="" alt="">
                              </div>
                          </td>
                          <td>
                              <div class="${clickedTooltipArtistName}">
                                  <span id="${clickedTooltipArtistName}-3"></span>
                              </div>
                          </td>
                      </tr>
                      <tr>
                          <td>
                              <div class="${clickedTooltipArtistImageDiv}">
                                  <img id="${clickedTooltipArtistImageID}-4" src="" alt="">
                              </div>
                          </td>
                          <td>
                              <div class="${clickedTooltipArtistName}">
                                  <span id="${clickedTooltipArtistName}-4"></span>
                              </div>
                          </td>
                      </tr>
                  </table>
                  
             </div>
             <div id="${titleTextID}" class="title-text">
                <span>Spotify Genre Relationships</span>
             </div>
             <div id="${descriptionTextID}" class="description-text">
                <span>
                ${description}
                </span>
             </div>
             <div id="${genreCheckboxDivID}" class="${genreCheckboxDivID}">
                 <input type="checkbox" name="useAllGenres" id="${genreCheckboxID}" ${genreChecked}>
                 <label for="useAllGenres">Use All Genres (this takes a bit to run -- but looks pretty sweet!)</label>
             </div>`

        const sourceHTML =
            `<div id="${sourceTextID}" class="source-text">
                <span>
                This chart was built on top of data from the Spotify API. Click 
                <a href="https://developer.spotify.com/documentation/web-api/reference/#/operations/search"
                target="_blank">here</a> to see how.
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

        d3.selectAll(`#${titleTextID}, #${descriptionTextID}, #${sourceTextID}, #${genreCheckboxDivID}`)
            .style("margin-left", `${dimensions.margin.left}px`)
            .style("margin-right", `${dimensions.margin.right}px`)

        const chart = wrapper.append("g")
            .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

        // Chart specific code starts here
        const centerX = dimensions.boundedWidth/2
        const centerY = dimensions.boundedHeight/2
        const center = [{
            id: "center",
            order: -1,
            related_artists: [],
            related_genre_count: -1,
            total_weight: -1,
            fx: centerX,
            fy: centerY,
            radius: dimensions.boundedWidth/6
        }]

        if (afterFirstRun) {
            dataset.nodes.splice(0, 1)
        }

        const radiusScaleMax = d3.scaleLinear()
            .domain([widthSmall, widthLarge])
            .range([dimensions.boundedWidth/16, dimensions.boundedWidth/20])

        const radiusScale = d3.scaleLinear()
            .domain(d3.extent(dataset.nodes, d => d.total_weight))
            .range([1, radiusScaleMax(dimensions.boundedWidth)])

        const initialPositionScale = d3.scaleLinear()
            .domain(d3.extent(dataset.nodes, d => d.order))
            .range([0, 2 * Math.PI])

        // Color Palette from https://medialab.github.io/iwanthue/
        // Default colorspace, 20 colors, hard (Force vector)
        const colors = ["#ef9e00", "#5c6ffa", "#43cd4f", "#6436b3",
                        "#d4c956", "#028bfe", "#6e8300", "#c887ff",
                        "#365c17", "#eda6ff", "#6f5200", "#654191",
                        "#add188", "#ce0060", "#006ca5", "#ff954a",
                        "#c59ac9", "#ff4058", "#8e3054", "#a01e22"]
        const colorScale = d3.scaleOrdinal()
            .domain(d3.extent(dataset.nodes, d => d.group))
            .range(Array(d3.max(dataset.nodes, d => d.group)).fill().map((_, i) => colors[i % colors.length]))

        // Loop through to set the radius for each node
        dataset.nodes.forEach(function (d) {
            d.radius = radiusScale(d.total_weight)
            d.x = centerX + (dimensions.boundedWidth/3) * Math.cos(initialPositionScale(d.order))
            d.y = centerY + (dimensions.boundedWidth/3) * Math.sin(initialPositionScale(d.order))
        })

        dataset.nodes = center.concat(dataset.nodes)

        let forceCollide = d3.forceCollide(d => d.radius + 1).strength(0.0)

        simulation.stop()
        simulation.alpha(1)

        simulation
            .nodes(dataset.nodes)
            .force("link", d3.forceLink(dataset.links).id(d => d.id).distance(1))
            .force("collide", forceCollide)
            .force("center", d3.forceCenter(dimensions.boundedWidth/2, dimensions.boundedHeight/2))
            .velocityDecay(0.1)
            .on("tick", ticked)

        simulation.restart()

        const nodes = chart.selectAll(".genre-nodes-" + visID)
            .data(dataset.nodes).enter()
            .append("circle")
            .attr("fill", d => d.group === 0 ? "#000000": colorScale(d.group))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.radius)
            .attr("class", d => d.id === "center" ? "center-node-" + visID: "genre-nodes-" + visID)
            .attr("id", d => "genre-node-" + d.id.replace(/[^a-zA-Z0-9]/g, '-') + "-" + visID)

        d3.select(`#genre-node-center-${visID}`)
            .attr("fill", "transparent")

        chart.selectAll(".genre-nodes-" + visID)
            .on("mouseenter", onMouseEnter)
            .on("mouseleave", onMouseLeave)
            .on("click", onClick)
            .on("focus", onFocus)
            .on("blur", onBlur)

        const checkbox = d3.select(`#${genreCheckboxID}`)

        checkbox.on("change", swapData)
        afterFirstRun = true

        const tooltip = d3.select(`#${tooltipID}`)
        const tooltipRect = tooltip.node().getBoundingClientRect()
        const tooltipWidth = tooltipRect.width
        const tooltipHeight = tooltipRect.height
        const headerSize = wrapper.node().getBoundingClientRect().y -
            d3.select(`#${d3DivID}`).node().getBoundingClientRect().y

        const clickedTooltip = d3.select(`#${clickedTooltipID}`)
        const clickedTooltipRect = clickedTooltip.node().getBoundingClientRect()
        const clickedTooltipWidth = clickedTooltipRect.width
        const clickedTooltipHeight = clickedTooltipRect.height
        const clickedTooltipXScale = d3.scaleLinear()
            .domain([0, dimensions.boundedWidth])
            .range([1/2 * clickedTooltipWidth, -1/2 * clickedTooltipWidth])

        tooltip.style("transform", `translate(0px, -${tooltipHeight}px)`)
        clickedTooltip.style("transform", `translate(0px, -${clickedTooltipHeight}px)`)

        function ticked() {
            nodes
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
            const alpha = simulation.alpha()
            const strength = 0.48*Math.tanh(20*((1-alpha) - 0.95)) + 0.51
            forceCollide.strength(strength)
        }

        function onMouseEnter(event, datum) {

            d3.selectAll(".genre-nodes-" + visID)
                .style("opacity", 0.05)

            // Get all connections to hovered node
            let connectedNodeIDs = []
            dataset.links.forEach(d => {
                if ((d.source.id === datum.id) || (d.target.id === datum.id)) {
                    if (d.source.id === datum.id){
                        if (connectedNodeIDs.indexOf(d.target.id) === -1) {
                            connectedNodeIDs.push(`#genre-node-${d.target.id.replace(/[^a-zA-Z0-9]/g, '-')}-${visID}`)
                        }
                    } else {
                        if (connectedNodeIDs.indexOf(d.source.id) === -1) {
                            connectedNodeIDs.push(`#genre-node-${d.source.id.replace(/[^a-zA-Z0-9]/g, '-')}-${visID}`)
                        }
                    }

                }
            })

            d3.selectAll(connectedNodeIDs.toString())
                .style("opacity", 1.0)
            d3.select(`#genre-node-${datum.id.replace(/[^a-zA-Z0-9]/g, '-')}-${visID}`)
                .style("opacity", 1.0)


            tooltip.select(`#${tooltipGenreID}`)
                .text(datum.id)

            // This would position the tooltip right where the mouse is.
            // const divBoundingRect = d3.select(`#${d3DivID}`).node().getBoundingClientRect()
            // const viewportX = divBoundingRect.x
            // const viewportY = divBoundingRect.y
            // const tooltipX = datum.x - viewportX
            // const tooltipY = datum.y - viewportY

            let tooltipX = dimensions.margin.left - tooltipWidth/2
            let tooltipY = dimensions.margin.top + headerSize - tooltipHeight/2

            tooltipY += dimensions.boundedHeight/2
            tooltipX += dimensions.boundedWidth/2

            tooltip.style("transform", `translate(${tooltipX}px, ${tooltipY}px)`)
            tooltip.style("opacity", 1)
        }

        function onMouseLeave(event, datum) {
            // d3.selectAll(".genre-nodes-" + visID)
            //     .attr("fill", "rgba(0, 0, 0)")
            d3.selectAll(".genre-nodes-" + visID)
                .style("opacity", 1.0)
            tooltip.style("opacity", 0)
            tooltip.style("transform", `translate(0px, -${tooltipHeight}px)`)
        }

        function onClick(event, datum) {
            clickedTooltip.select(`#${tooltipGenreID}`)
                .text(datum.id)

            datum.related_artists.forEach(function (d, i) {
                clickedTooltip.select(`#${clickedTooltipArtistImageID}-${i}`)
                    .attr("src", d.image_url)
                clickedTooltip.select(`#${clickedTooltipArtistName}-${i}`)
                    .text(d.name)
            })

            const tooltipYBuffer = 10
            let tooltipX = datum.x + dimensions.margin.left - clickedTooltipWidth/2
            let tooltipY = datum.y + dimensions.margin.top + headerSize - clickedTooltipHeight/2
            let yOffset = 0
            if (datum.y <= dimensions.boundedHeight/2) {
                // Tooltip below the data point
                yOffset = tooltipYBuffer + datum.radius + clickedTooltipHeight/2
            } else {
                yOffset = -tooltipYBuffer - datum.radius - clickedTooltipHeight/2
            }

            const xOffset = clickedTooltipXScale(datum.x)

            tooltipY += yOffset
            tooltipX += xOffset

            clickedTooltip.style("transform", `translate(${tooltipX}px, ${tooltipY}px)`)
            clickedTooltip.style("opacity", 1)
        }

        function onFocus() {

        }

        function onBlur(event, datum) {
            clickedTooltip.style("transform", `translate(0px, -${clickedTooltipHeight}px)`)
            clickedTooltip.style("opacity", 0)
        }

        async function swapData(event) {
            if (event.target.checked) {
                dataset = await d3.json(largeDataFile)
                genreChecked = "checked"
                afterFirstRun = false
                drawChart()
            } else {
                dataset = await d3.json(smallDataFile)
                genreChecked = ""
                afterFirstRun = false
                drawChart()
            }
        }

    }

}

genreRelationshipGraph()