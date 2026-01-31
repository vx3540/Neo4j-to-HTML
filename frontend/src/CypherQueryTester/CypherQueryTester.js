import React, { useState, useEffect, useRef } from "react";
// import "./configuration.css";  //this doesnt work for this page but does for the rest.
import "./CypherQueryTester.css"  //this messes up the existing css, but works for this page 
import { useLocation } from "react-router-dom";
// import neo4j from "neo4j-driver"; //removed for integration

// function SimpleSelect({ value, onChange, options, placeholder = "Select...", style }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//    useEffect(() => {
//     const onDocMouseDown = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", onDocMouseDown);
//     return () => document.removeEventListener("mousedown", onDocMouseDown);
//   }, []);

//   const current = options.find((o) => o.value === value);

//   return (
//     <div
//       ref={ref}
//       style={{
//         width: "100%",
//         maxWidth: "32rem",
//         margin: "0 auto 1.5rem auto",
//         position: "relative",
//         ...style,
//       }}
//     >
//       <button
//         type="button"
//         onClick={() => setOpen((s) => !s)}
//         style={{
//           width: "100%",
//           textAlign: "left",
//           padding: "0.75rem 1rem",
//           border: "1px solid #ccc",
//           borderRadius: "4px",
//           fontSize: "0.95rem",
//           background: "#fff",
//           color: "#333",
//           cursor: "pointer",
//         }}
//       >
//         <span>{current ? current.label : placeholder}</span>
//         <span style={{ float: "right" }}>▾</span>
//       </button>

//       {open && (
//         <ul
//           style={{
//             listStyle: "none",
//             margin: 0,
//             padding: "0.25rem",
//             position: "absolute",
//             top: "100%",
//             left: 0,
//             right: 0,
//             background: "#fff",
//             border: "1px solid #ccc",
//             borderRadius: "6px",
//             boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
//             maxHeight: "220px",
//             overflowY: "auto",
//             zIndex: 1000,
//           }}
//         >
//           {options.map((opt) => (
//             <li key={opt.value}>
//               <button
//                 type="button"
//                 onMouseDown={(e) => {
//                   e.preventDefault();
//                   onChange(opt.value);
//                   setOpen(false);
//                 }}
//                 style={{
//                   display: "block",
//                   width: "100%",
//                   textAlign: "left",
//                   padding: "0.5rem 0.75rem",
//                   border: "none",
//                   background: value === opt.value ? "#f0f0f0" : "transparent",
//                   color: "#333",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                 }}
//                 onMouseOver={(e) => (e.currentTarget.style.background = "#f5f5f5")}
//                 onMouseOut={(e) =>
//                   (e.currentTarget.style.background =
//                     value === opt.value ? "#f0f0f0" : "transparent")
//                 }
//               >
//                 {opt.label}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

function SimpleSelect({ value, onChange, options, placeholder = "Select...", style }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        maxWidth: "32rem",
        margin: "0 auto 1.5rem auto",
        position: "relative",
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "0.75rem 1rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "0.95rem",
          background: "#fff",
          color: "#333",
          cursor: "pointer",
        }}
      >
        <span>{current ? current.label : placeholder}</span>
        <span style={{ float: "right" }}>▾</span>
      </button>

      {open && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: "0.25rem",
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            maxHeight: "220px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  background: value === opt.value ? "#f0f0f0" : "transparent",
                  color: "#333",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    value === opt.value ? "#f0f0f0" : "transparent")
                }
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CypherQueryTester() {
  const { state } = useLocation();
  const {
    selectedNode = {},
    uri = "",
    username = "",
    password = "",
    browseFullGraph = false,
  } = state || {};

  const { label: nodeLabel } = selectedNode || {};



  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resultsPageContent, setResultsPageContent] = useState("");
  const [queryType, setQueryType] = useState("");

  const [menuOptions, setMenuOptions] = useState([]);


const fetchDynamicMenuOptions = async () => {
  if (!nodeLabel) return;

  try {
    let storedUri = sessionStorage.getItem("neo4j_uri");
    let storedUsername = sessionStorage.getItem("neo4j_username");
    let storedPassword = sessionStorage.getItem("neo4j_password");

    const cypher = `
      MATCH (n:${nodeLabel})-[r]->() RETURN DISTINCT type(r) AS relType, 'OUTGOING' AS direction
      UNION
      MATCH (n:${nodeLabel})<-[r]-() RETURN DISTINCT type(r) AS relType, 'INCOMING' AS direction
    `;

    const response = await fetch("http://localhost:3001/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cypher,
        uri: storedUri,
        username: storedUsername,
        password: storedPassword,
      }),
    });

    const result = await response.json();

    const options = result.map((record) => {
      const relType = record.relType || record[0];
      const direction = record.direction || record[1];
      return {
        name: `${relType} (${direction})`,
        query: `MATCH (n:${nodeLabel})${direction === "OUTGOING" ? "-[r:" : "<-[r:"}${relType}]${direction === "OUTGOING" ? "->(m)" : "-(m)"} RETURN n, r, m LIMIT 10`,
      };
    });

    setMenuOptions(options);
  } catch (error) {
    console.error("Error fetching dynamic menu options:", error);
  }
};


  const generateResultsPage = (data, options = {}) => {
    const { allowSelection = false } = options;
    const scaleFactor = allowSelection ? 0.6 : 1.0;
    const getRandomColor = () => {
      const h = Math.floor(Math.random() * 360);
      const s = Math.floor(50 + Math.random() * 30);
      const l = Math.floor(65 + Math.random() * 20);
      return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const nodes = [];
    const links = [];
    const nodeTypeColors = {};

    data.forEach((item) => {
      Object.values(item).forEach((entry) => {
        if (entry.startNodeElementId && entry.endNodeElementId && entry.type) {
          links.push({
            id: entry.elementId,
            source: entry.startNodeElementId,
            target: entry.endNodeElementId,
            type: entry.type,
          });
        } else if (entry.elementId && entry.labels && entry.properties) {
          const nodeLabel = entry.labels[0];
          if (!nodeTypeColors[nodeLabel]) {
            nodeTypeColors[nodeLabel] = getRandomColor();
          }
          nodes.push({
            id: entry.elementId,
            label: entry.labels[0],
            properties: entry.properties,
            color: nodeTypeColors[nodeLabel],
          });
        }
      });
    });
    const uniqueNodes = Array.from(
      new Map(nodes.map((node) => [node.id, node])).values()
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f9f9f9;
            overflow: auto;
            margin: 0;
          }

          h1 {
            text-align: center;
            
          }
        #graph-container {
  width: ${allowSelection ? "300vw" : "2000px"};
  height: ${allowSelection ? "300vh" : "2000px"};
  margin-top: 20px;
  overflow: auto;
  position: relative;
}

#graph-wrapper, #subgraph-wrapper {
  transition: transform 0.2s ease-out;
}


          text {
            font-size: 12px;
          }


          .node-details {
            display: none;
            margin-top: 15px;
            
            font-size: 14px;
            color: #444;
            line-height: 1.6;
            background: #f9f9f9;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
            max-height: 100px; /* Limit height for details */
            overflow-y: auto; /* Scrollable details */
          }

          .node-card h3 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }

          .node-card p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }

          .node-details p {
            margin: 5px 0;
            font-size: 12px;
            color: #444;
          }
          .link-label {
            font-size: 14px;
            font-weight: bold;
            fill: #333;
          }
          .selected {
            outline: 4px solid #ff9800;
            z-index: 999;
          }

          body::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          body::-webkit-scrollbar-thumb {
            background-color: #ccc;
            border-radius: 10px;
          }


        </style>
        <script src="https://d3js.org/d3.v6.min.js"></script>
      </head>
      <body>
    

        <div id="instruction-text" style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 8px 12px;
            border-radius: 5px; font-size: 14px;">
            Drag the nodes to move them around!
        </div>
          ${allowSelection ? `
          <div id="toolbar" style="
            position:absolute;
            top:10px;
            right:10px;
            background:rgba(255,255,255,0.9);
            padding:8px;
            border-radius:8px;
            box-shadow:0 2px 6px rgba(0,0,0,0.15);
            display:flex;
            gap:8px;
            z-index:1000;">
            <button id="showSelectedBtn" style="padding:6px 10px;cursor:pointer;">Show Selected Subgraph</button>
            <button id="clearSelectionBtn" style="padding:6px 10px;cursor:pointer;">Clear Selection</button>
          </div>
          ` : `
          <div id="limit-control" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: #ffffffcc;
          backdrop-filter: blur(6px);
          border: 1px solid #ddd;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Inter', Arial, sans-serif;
          z-index: 1000;
        ">
          <label for="limitInput" style="
            font-size: 14px;
            font-weight: 600;
            color: #333;
          ">
            Limit:
          </label>

          <input id="limitInput" type="number" value="10" min="1" max="500" style="
            width: 80px;
            padding: 6px 8px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 8px;
            outline: none;
            transition: border-color 0.2s ease;
          " onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#ccc'">

          <button id="updateLimitBtn" style="
            background: #007bff;
            color: #fff;
            border: none;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.25s ease;
          " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">
            Update
          </button>
        </div>

          `}

        <div id="graph-container"></div>
        <script>
          const nodes = ${JSON.stringify(uniqueNodes)};
          const links = ${JSON.stringify(links)};

          setTimeout(() => {
                  d3.select("#instruction-text")
                    .transition()
                    .duration(2000)  
                    .style("opacity", 0.2); 
                }, 4000);

          // 🟢 Use a much larger virtual space for the full graph view
          const width = ${allowSelection ? "window.innerWidth * 3" : "window.innerWidth * 0.9"};
          const height = ${allowSelection ? "window.innerHeight * 3" : "window.innerHeight * 0.9"};


          // Create a wrapper to hold SVG + node cards together for unified zoom
          //vasana
          const graphWrapper = d3.select('#graph-container')
            .append('div')
            .attr('id', 'graph-wrapper')
            .style('transform-origin', '0 0')
            .style('position', 'relative')
            .style('width', width + 'px')
            .style('height', height + 'px');

          const svg = graphWrapper
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('position', 'absolute')
            .style('top', '0')
            .style('left', '0');

  
          const simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(${allowSelection ? -2500 : -600}))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('link', d3.forceLink(links).id(d => d.id).distance(${allowSelection ? 350 : 200}))
        .force('collide', d3.forceCollide().radius(${allowSelection ? 25 : 20}).strength(1));



          simulation.alpha(1).restart(); 
          // 🟢 Enable zoom and pan on the entire graph wrapper
          let currentZoom = 1;
          let currentTranslate = { x: 0, y: 0 };

          const zoom = d3.zoom()
            .scaleExtent([0.3, 3])  // min and max zoom
            .on('zoom', (event) => {
              currentZoom = event.transform.k;
              currentTranslate = { x: event.transform.x, y: event.transform.y };

              graphWrapper
                .style('transform', 'translate(' + currentTranslate.x + 'px,' + currentTranslate.y + 'px) scale(' + currentZoom + ')');

            });

          d3.select('#graph-container').call(zoom);
          d3.select('#graph-container').call(zoom.transform, d3.zoomIdentity.scale(0.7));



          function showHandAnimation() {
            setTimeout(() => {
              const simNodes = simulation.nodes(); 
              if (simNodes.length === 0) return; 

              const randomNode = simNodes[Math.floor(Math.random() * simNodes.length)]; 
              if (!randomNode) return; // Ensure it's valid

              const handIcon = d3.select("#graph-container")
                .append("img")
                .attr("src", "hand.svg")  
                .attr("class", "hand-icon")
                .style("position", "absolute")
                .style("width", "40px") 
                .style("height", "40px")
                .style("opacity", 1)
                .style("left", randomNode.x + "px") 
                .style("top", randomNode.y + "px");

              let dragCount = 0;
              function animateHand() {
                if (dragCount > 3) {
                  handIcon.transition().duration(2000).style("opacity", 0).remove(); 
                  return;
                }
                handIcon.transition()
                  .duration(500)
                  .style("left", (randomNode.x + 20) + "px") // Move right
                  .style("top", (randomNode.y + 10) + "px")
                  .transition()
                  .duration(500)
                  .style("left", (randomNode.x - 10) + "px") // Move left
                  .style("top", (randomNode.y - 10) + "px")
                  .on("end", () => {
                    dragCount++;
                    animateHand();
                  });
              }
              animateHand();
            }, 500); 
          }

          simulation.on("end", showHandAnimation); 

          const dragHandler = d3.drag()
            .on("start", (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on("drag", (event, d) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on("end", (event, d) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            });


          const nodeElements = svg.selectAll('.node')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', ${allowSelection ? 3 : 6})
            .attr('fill', d => d.color || '#3498db') 
            .call(dragHandler); 
          // allow clicking nodes to select them
          nodeElements.on("click", (event, d) => {
            d3.select(event.target).classed("selected", !d3.select(event.target).classed("selected"));
          });

          const linkElements = svg.selectAll('.link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .style('stroke', '#aaa')
            .style('stroke-width', ${allowSelection ? 1 : 2});


          const linkLabels = svg.selectAll('.link-label')
            .data(links)
            .enter()
            .append('text')
            .attr('class', 'link-label')
            .attr('text-anchor', 'middle')
            .attr('dy', -5)
            .style('font-size', '${allowSelection ? 10 : 14}px')
            .text(d => d.type);

    
    
          const nodeCards = graphWrapper
            .selectAll('.node-card')
            .data(nodes)
            .enter()
            .append('div')
            .attr('class', 'node-card')
            .style('position', 'absolute')
            .style('background', d => d.color)
            .style('border-radius', '12px')
            .style('padding', '${allowSelection ? 6 : 10}px')
            .style('color', '#333333')
            .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
            .style('width', '${allowSelection ? 100 : 150}px') 
            .style('height', 'auto') 
            .style('overflow', 'hidden') 
            .style('transition', 'transform 0.2s, box-shadow 0.2s') 
            .style('cursor', 'pointer')
            .each(function (d) {
              const card = d3.select(this);
              card.append('h3')
                .style('margin', '0 0 10px 0')
                .style('font-size', '${allowSelection ? 14 : 18}px')
                .style('font-weight', '600')
                .style('color', '#333')
                .style('text-align', 'center')
                .text(d.properties.name || d.properties.title);

              card.append('p')
                .style('margin', '0')
                .style('font-size', '${allowSelection ? 12 : 14}px')
                .style('color', '#666')
                .style('text-align', 'center')
                .text(d.label);

              const detailsDiv = card.append('div')
                .attr('class', 'node-details')
                .style('display', 'none')
                .style('margin-top', '10px')
                .style('font-size', '12px')
                .style('color', '#eee');

              for (const key in d.properties) {
                if (d.properties.hasOwnProperty(key)) {
                  detailsDiv.append('p')
                    .text(key + ': ' + d.properties[key]);
                }
              }
            })

            .on('click', function (event, d) {
              event.stopPropagation();
              const card = d3.select(this);
              card.classed("selected", !card.classed("selected"));
            })

            .on('dblclick', function (event, d) {
              const card = d3.select(this);
              const isExpanded = card.classed('expanded');
              if (isExpanded) {
                card.classed('expanded', false)
                  .style('width', '${allowSelection ? 100 : 150}px')
                  .style('height', 'auto')
                  .style('background', d.color)
                  .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
                  .style('z-index', 1);

                card.select('.node-details').style('display', 'none');
              } else {
                card.classed('expanded', true)
                  .style('width', '300px')
                  .style('background', '#fff')
                  .style('box-shadow', '0px 4px 12px rgba(0, 0, 0, 0.2)')
                  .style('z-index', 1000);

                const detailsDiv = card.select('.node-details');
                if (d.properties.image_data) {
                  detailsDiv.append('img')
                    .attr('src', 'data:image/jpeg;base64,' + d.properties.image_data)
                    .style('width', '100%')
                    .style('border-radius', '8px')
                    .style('margin-top', '10px');
                }
                detailsDiv.style('display', 'block')
                  .style('margin-top', '10px')
                  .style('font-size', '${allowSelection ? 12 : 14}px')
                  .style('color', '#444')
                  .style('line-height', '1.6')
                  .style('background', '#f9f9f9')
                  .style('border-radius', '8px')
                  .style('padding', '${allowSelection ? 6 : 10}px')
                  .style('box-shadow', '0px 2px 6px rgba(0, 0, 0, 0.1)')
                  .style('max-height', '150px')
                  .style('overflow-y', 'auto');
              }
            });

          dragHandler(nodeCards);

          function constrainToBoundary(d) {
            const cardWidth = 150; 
            const cardHeight = 100;
            d.x = Math.max(0, Math.min(width - cardWidth, d.x));
            d.y = Math.max(0, Math.min(height - cardHeight, d.y));
          }
  
          function constrainLinkLabel(d) {
            const labelPadding = 10; 
            let midX = (d.source.x + d.target.x) / 2;
            let midY = (d.source.y + d.target.y) / 2;
            d.labelX = Math.max(labelPadding, Math.min(width - labelPadding, midX));
            d.labelY = Math.max(labelPadding, Math.min(height - labelPadding, midY));
          }


          simulation.on('tick', () => {
            nodes.forEach(constrainToBoundary);
            links.forEach(constrainLinkLabel);

            nodeCards
              .style('left', d => d.x + 'px')
              .style('top', d => d.y + 'px');

            linkElements
            .attr('x1', d => {
              return d.source.x;
            })
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
          

            linkLabels
            .attr('x', d => (d.source.x + d.target.x) / 2) 
            .attr('y', d => (d.source.y + d.target.y) / 2);
                  });

            ${allowSelection ? `
document.getElementById("showSelectedBtn").addEventListener("click", () => {

  const selectedNodes = nodes.filter(n => {
    const card = d3.selectAll('.node-card').filter(d => d.id === n.id);
    return card.classed("selected");
  });

  if (selectedNodes.length === 0) {
    alert("No nodes selected!");
    return;
  }


  const selectedNodeIds = new Set(selectedNodes.map(n => n.id));


  const selectedLinks = links.filter(l =>
    selectedNodeIds.has(l.source.id || l.source) &&
    selectedNodeIds.has(l.target.id || l.target)
  );

  // 🧹 Clear old content
d3.select("#graph-container").selectAll("*").remove();

// 🟢 Create wrapper for SVG + cards (for unified zoom/pan)
const subWrapper = d3.select("#graph-container")
  .append("div")
  .attr("id", "subgraph-wrapper")
  .style("position", "relative")
  .style("transform-origin", "0 0")
  .style("width", width + "px")
  .style("height", height + "px");

const subSvg = subWrapper
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("position", "absolute")
  .style("top", "0")
  .style("left", "0");

// 🧲 Subgraph simulation
const subSim = d3.forceSimulation(selectedNodes)
  .force('charge', d3.forceManyBody().strength(-1500))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('link', d3.forceLink(selectedLinks).id(d => d.id).distance(250))
  .force('collide', d3.forceCollide().radius(25).strength(1));

// 🟢 Enable zoom + pan
let subZoomLevel = 1;
let subTranslate = { x: 0, y: 0 };

const subZoom = d3.zoom()
  .scaleExtent([0.3, 3])
  .on("zoom", (event) => {
    subZoomLevel = event.transform.k;
    subTranslate = { x: event.transform.x, y: event.transform.y };

    subWrapper.style(
      "transform",
      "translate(" + subTranslate.x + "px," + subTranslate.y + "px) scale(" + subZoomLevel + ")"
    );
  });

d3.select("#graph-container").call(subZoom);

// 🧭 Start slightly zoomed out so all selected nodes are visible
d3.select("#graph-container").call(subZoom.transform, d3.zoomIdentity.scale(0.7));



  const subLinks = subSvg.selectAll(".link")
    .data(selectedLinks)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#999")
    .attr("stroke-width", 2);


  const subLinkLabels = subSvg.selectAll(".link-label")
    .data(selectedLinks)
    .enter()
    .append("text")
    .attr("class", "link-label")
    .attr("text-anchor", "middle")
    .attr("dy", -5)
    .style("font-size", "14px")
    .style("fill", "#333")
    .style("pointer-events", "none")
    .text(d => d.type);

  const subCards = subWrapper
    .selectAll('.node-card')
    .data(selectedNodes)
    .enter()
    .append('div')
    .attr('class', 'node-card')
    .style('position', 'absolute')
    .style('background', d => d.color)
    .style('border-radius', '12px')
    .style('padding', '${allowSelection ? 6 : 10}px')
    .style('color', '#333333')
    .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
    .style('width', '${allowSelection ? 100 : 150}px')
    .style('cursor', 'pointer')
    .each(function (d) {
      const card = d3.select(this);
      card.append('h3')
        .style('margin', '0 0 10px 0')
        .style('font-size', '${allowSelection ? 14 : 18}px')

        .style('font-weight', '600')
        .style('color', '#333')
        .style('text-align', 'center')
        .text(d.properties.name || d.properties.title);

      card.append('p')
        .style('margin', '0')
        .style('font-size', '${allowSelection ? 12 : 14}px')
        .style('color', '#666')
        .style('text-align', 'center')
        .text(d.label);
    })

    .on('click', function (event, d) {
      event.stopPropagation();
      const card = d3.select(this);
      const isExpanded = card.classed('expanded');

      if (isExpanded) {
        card.classed('expanded', false)
          .style('width', '${allowSelection ? 100 : 150}px')
          .style('height', 'auto')
          .style('background', d.color)
          .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
          .style('z-index', 1);
        card.select('.node-details').remove();
      } else {
        card.classed('expanded', true)
          .style('width', '300px')
          .style('background', '#fff')
          .style('box-shadow', '0px 4px 12px rgba(0, 0, 0, 0.2)')
          .style('z-index', 1000);

        const detailsDiv = card.append('div')
          .attr('class', 'node-details')
          .style('display', 'block')
          .style('margin-top', '10px')
          .style('font-size', '${allowSelection ? 12 : 14}px')
          .style('color', '#444')
          .style('line-height', '1.6')
          .style('background', '#f9f9f9')
          .style('border-radius', '8px')
          .style('padding', '${allowSelection ? 6 : 10}px')
          .style('box-shadow', '0px 2px 6px rgba(0, 0, 0, 0.1)')
          .style('max-height', '150px')
          .style('overflow-y', 'auto');

        for (const key in d.properties) {
          if (d.properties.hasOwnProperty(key)) {
            detailsDiv.append('p').text(key + ': ' + d.properties[key]);
          }
        }
      }
    });

  const dragHandler = d3.drag()
    .on("start", (event, d) => {
      if (!event.active) subSim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) subSim.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  dragHandler(subCards);

  subSim.on("tick", () => {
    subLinks
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    subLinkLabels
      .attr("x", d => (d.source.x + d.target.x) / 2)
      .attr("y", d => (d.source.y + d.target.y) / 2);

    subCards
      .style("left", d => d.x + "px")
      .style("top", d => d.y + "px");
  });
});

              

                document.getElementById("clearSelectionBtn").addEventListener("click", () => {
                  d3.selectAll(".node-card").classed("selected", false);
d3.select("#graph-container").selectAll("*").remove();

// 🟢 Recreate wrapper for unified zoom + pan
const fullWrapper = d3.select("#graph-container")
  .append("div")
  .attr("id", "graph-wrapper")
  .style("position", "relative")
  .style("transform-origin", "0 0")
  .style("width", width + "px")
  .style("height", height + "px");

const fullSvg = fullWrapper
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("position", "absolute")
  .style("top", "0")
  .style("left", "0");

// 🧲 Restore full simulation
const fullSim = d3.forceSimulation(nodes)
  .force('charge', d3.forceManyBody().strength(-2500))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('link', d3.forceLink(links).id(d => d.id).distance(350))
  .force('collide', d3.forceCollide().radius(25).strength(1));

// 🟢 Reattach D3 zoom and pan
let fullZoomLevel = 1;
let fullTranslate = { x: 0, y: 0 };

const fullZoom = d3.zoom()
  .scaleExtent([0.3, 3])
  .on("zoom", (event) => {
    fullZoomLevel = event.transform.k;
    fullTranslate = { x: event.transform.x, y: event.transform.y };
    fullWrapper.style(
      "transform",
      "translate(" + fullTranslate.x + "px," + fullTranslate.y + "px) scale(" + fullZoomLevel + ")"
    );
  });

d3.select("#graph-container").call(fullZoom);
d3.select("#graph-container").call(fullZoom.transform, d3.zoomIdentity.scale(0.7));



                  const fullLinks = fullSvg.selectAll(".link")
                    .data(links)
                    .enter()
                    .append("line")
                    .attr("class", "link")
                    .attr("stroke", "#aaa")
                    .attr("stroke-width", 2);


                  const fullLinkLabels = fullSvg.selectAll(".link-label")
                    .data(links)
                    .enter()
                    .append("text")
                    .attr("class", "link-label")
                    .attr("text-anchor", "middle")
                    .attr("dy", -5)
                    .style("font-size", "14px")
                    .style("fill", "#333")
                    .style("pointer-events", "none")
                    .text(d => d.type);

                  const fullCards = fullWrapper
                    .selectAll('.node-card')
                    .data(nodes)
                    .enter()
                    .append('div')
                    .attr('class', 'node-card')
                    .style('position', 'absolute')
                    .style('background', d => d.color)
                    .style('border-radius', '12px')
                    .style('padding', '${allowSelection ? 6 : 10}px')
                    .style('color', '#333333')
                    .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
                    .style('width', '${allowSelection ? 100 : 150}px')
                    .style('cursor', 'pointer')
                    .each(function (d) {
                      const card = d3.select(this);
                      card.append('h3')
                        .style('margin', '0 0 10px 0')
                        .style('font-size', '${allowSelection ? 14 : 18}px')

                        .style('font-weight', '600')
                        .style('color', '#333')
                        .style('text-align', 'center')
                        .text(d.properties.name || d.properties.title);

                      card.append('p')
                        .style('margin', '0')
                        .style('font-size', '${allowSelection ? 12 : 14}px')
                        .style('color', '#666')
                        .style('text-align', 'center')
                        .text(d.label);
                    })
                    // Click to select
                    .on('click', function (event, d) {
                      event.stopPropagation();
                      const card = d3.select(this);
                      card.classed("selected", !card.classed("selected"));
                    })
                    // Double-click to expand details
                    .on('dblclick', function (event, d) {
                      const card = d3.select(this);
                      const isExpanded = card.classed('expanded');
                      if (isExpanded) {
                        card.classed('expanded', false)
                          .style('width', '${allowSelection ? 100 : 150}px')
                          .style('height', 'auto')
                          .style('background', d.color)
                          .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
                          .style('z-index', 1);
                        card.select('.node-details').remove();
                      } else {
                        card.classed('expanded', true)
                          .style('width', '300px')
                          .style('background', '#fff')
                          .style('box-shadow', '0px 4px 12px rgba(0, 0, 0, 0.2)')
                          .style('z-index', 1000);

                        const detailsDiv = card.append('div')
                          .attr('class', 'node-details')
                          .style('display', 'block')
                          .style('margin-top', '10px')
                          .style('font-size', '${allowSelection ? 12 : 14}px')
                          .style('color', '#444')
                          .style('line-height', '1.6')
                          .style('background', '#f9f9f9')
                          .style('border-radius', '8px')
                          .style('padding', '${allowSelection ? 6 : 10}px')
                          .style('box-shadow', '0px 2px 6px rgba(0, 0, 0, 0.1)')
                          .style('max-height', '150px')
                          .style('overflow-y', 'auto');

                        for (const key in d.properties) {
                          if (d.properties.hasOwnProperty(key)) {
                            detailsDiv.append('p').text(key + ': ' + d.properties[key]);
                          }
                        }
                      }
                    });


                  const dragHandler = d3.drag()
                    .on("start", (event, d) => {
                      if (!event.active) fullSim.alphaTarget(0.3).restart();
                      d.fx = d.x;
                      d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                      d.fx = event.x;
                      d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                      if (!event.active) fullSim.alphaTarget(0);
                      d.fx = null;
                      d.fy = null;
                    });

                  dragHandler(fullCards);

                  fullSim.on("tick", () => {
                    fullLinks
                      .attr("x1", d => d.source.x)
                      .attr("y1", d => d.source.y)
                      .attr("x2", d => d.target.x)
                      .attr("y2", d => d.target.y);

                    fullLinkLabels
                      .attr("x", d => (d.source.x + d.target.x) / 2)
                      .attr("y", d => (d.source.y + d.target.y) / 2);

                    fullCards
                      .style("left", d => d.x + "px")
                      .style("top", d => d.y + "px");
                  });
                });
            ` : ""}

            document.getElementById("updateLimitBtn").addEventListener("click", async () => {
              const newLimit = document.getElementById("limitInput").value || 10;
              const parentWindow = window.parent;

              // Send the new limit to React parent
              parentWindow.postMessage({ type: "UPDATE_LIMIT", limit: Number(newLimit) }, "*");
            });

        </script>
      </body>
      </html>
    `;

    setResultsPageContent(htmlContent);
  };

  useEffect(() => {  
        if (nodeLabel) {
          fetchDynamicMenuOptions();
        }
      }, [nodeLabel]);

      useEffect(() => {
      const handleMessage = async (event) => {
        if (event.data?.type === "UPDATE_LIMIT") {
          const { limit } = event.data;
          try {
            const storedUri = sessionStorage.getItem("neo4j_uri");
            const storedUsername = sessionStorage.getItem("neo4j_username");
            const storedPassword = sessionStorage.getItem("neo4j_password");

            const updatedQuery = query.replace(/LIMIT \d+/i, `LIMIT ${limit}`);
            const response = await fetch("http://localhost:3001/query", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cypher: updatedQuery,
                uri: storedUri,
                username: storedUsername,
                password: storedPassword,
              }),
            });

            const data = await response.json();
            setResult(data);
            generateResultsPage(data, { allowSelection: browseFullGraph });
          } catch (err) {
            console.error("Error updating limit:", err);
          }
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, [query, browseFullGraph]);


  useEffect(() => {
  if (browseFullGraph) {
    const fetchFullGraph = async () => {
      try {
        const storedUri = sessionStorage.getItem("neo4j_uri");
        const storedUsername = sessionStorage.getItem("neo4j_username");
        const storedPassword = sessionStorage.getItem("neo4j_password");

        const response = await fetch("http://localhost:3001/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cypher: "MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100",
            uri: storedUri,
            username: storedUsername,
            password: storedPassword,
          }),
        });

        const data = await response.json();
        setResult(data);
        generateResultsPage(data, { allowZoom: true, allowSelection: true });

      } catch (err) {
        setError("Error loading full graph.");
        console.error("Error:", err);
      }
    };

    fetchFullGraph();
  }
}, [browseFullGraph]);


  const executeQuery = async () => {
    if (!query) {
      setError("Please select a query.");
      return;
    }
    setError(null);

    let storedUri = sessionStorage.getItem("neo4j_uri");
    let storedUsername = sessionStorage.getItem("neo4j_username");
    let storedPassword = sessionStorage.getItem("neo4j_password");

    if (!storedUri || !storedUsername || !storedPassword) {
      sessionStorage.clear();
      window.location.href = "/";
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cypher: query,
          uri: storedUri,
          username: storedUsername,
          password: storedPassword,
        }),
      });

      const data = await response.json();
      setResult(data);
      generateResultsPage(data);
    } catch (err) {
      setError("Error executing query. Please check the backend.");
      console.error("Error:", err);
    }
  };


  const handleQueryTypeChange = (e) => {
    const selectedOption = menuOptions.find((opt) => opt.name === e.target.value);
    setQueryType(e.target.value);
    setQuery(selectedOption ? selectedOption.query : "");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };


return (
    <div
      className="page-container"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflow: browseFullGraph ? "auto" : "hidden",
      }}
    >
    <div className="header-box">
      <div className="header-text">
        <h1 className="title">Graph Visualiser</h1>
        <p className="subtitle">
          {browseFullGraph ? "Literary Data From Archive" : `Node: ${nodeLabel}`}
        </p>
      </div>

      {error && (
        <p className="error-box">
          {error}
        </p>
      )}

    {!browseFullGraph && (
      <div className="query-controls">
        <SimpleSelect
  value={queryType}
  onChange={(val) => {
    setQueryType(val);
    const selectedOption = menuOptions.find((opt) => opt.name === val);
    setQuery(selectedOption ? selectedOption.query : "");
  }}
  options={menuOptions.map((option) => ({
    value: option.name,
    label: option.name,
  }))}
  placeholder="Select Query Type"
/>


        <button
          onClick={executeQuery}
          className="visualize-btn"
        >
          Visualize
        </button>
      </div>
    )}

    </div>

    <div
      className="results-section"
      style={{
        flexGrow: 1,
        width: "100%",
        height: browseFullGraph ? "calc(100vh - 200px)" : "75vh",
        overflowX: browseFullGraph ? "scroll" : "hidden",
        overflowY: browseFullGraph ? "scroll" : "hidden",
      }}
    >

      {resultsPageContent ? (
        <iframe
          srcDoc={resultsPageContent}
          title="Results"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            background: "#fff",
          }}
        ></iframe>

      ) : (
        <div className="results-placeholder">
          Run a query to see graph visualization.
        </div>
      )}
    </div>



    <div className="logout-section">
      <button
        onClick={handleLogout}
        className="logout-btn"
      >
        Logout
      </button>
    </div>
  </div>
);

  

}

export default CypherQueryTester;