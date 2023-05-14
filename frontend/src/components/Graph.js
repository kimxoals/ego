import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

const Graph = () => {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  // const [nodes, setNodes] = useState([
  //   { id: "node1" },
  //   { id: "node2" },
  //   { id: "node3" },
  // ]);
  // const [links, setLinks] = useState([
  //   { source: "node1", target: "node2" },
  //   { source: "node2", target: "node3" },
  // ]);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);

  useEffect(() => {
    // create a D3 simulation with a force-directed layout
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .strength(0)
      )
      .force("charge", d3.forceManyBody().strength(0))
      // .force("center", d3.forceCenter(300, 300))
      .on("tick", () => {
        // update the positions of the nodes and links on each tick of the simulation
        nodesSelection.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        linksSelection
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
      });

    // save the simulation to a ref for later use
    simulationRef.current = simulation;

    // create a D3 selection for the nodes and links
    const svg = d3.select(svgRef.current);
    const linksSelection = svg
      .select(".links")
      .selectAll(".link")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", 2);

    const nodesSelection = svg
      .select(".nodes")
      .selectAll(".node")
      .data(nodes)
      .join("circle")
      .attr("class", "node")
      .attr("r", 20)
      .attr("id", (d) => d.id)
      .call(drag(simulation));

    // const nodeRadius = 20;
    // const nodesSelection = svg
    //   .selectAll(".node")
    //   .data(nodes, (node) => node.id)
    //   .join("g")
    //   .attr("class", "node")
    //   .append("image")
    //   .attr("x", (node) => node.x - nodeRadius)
    //   .attr("y", (node) => node.y - nodeRadius)
    //   .attr("width", nodeRadius * 2)
    //   .attr("height", nodeRadius * 2)
    //   .attr("xlink:href", "./house.svg")
    //   .call(drag(simulation));

    svg.on("click", (event) => {
      const targetNode = d3.select(event.target).node();

      if (targetNode.nodeName === "svg") {
        // Clicked on empty space
        console.log("svg clicked");
        const point = d3.pointer(event);
        const id = `node${nodes.length + 1}`;
        const newNode = {
          id: id,
          x: point[0],
          y: point[1],
        };
        setNodes([...nodes, newNode]);
        setSelectedNodes([]);
      } else if (targetNode.classList.contains("node")) {
        // Clicked on a node
        const nodeId = targetNode.id;

        if (selectedNodes.length === 0) {
          // First node selected
          setSelectedNodes([nodeId]);
        } else if (selectedNodes.length === 1 && selectedNodes[0] !== nodeId) {
          // Second node selected, create link if it doesn't exist
          const linkExists = links.some((link) => {
            return (
              (link.source === selectedNodes[0] && link.target === nodeId) ||
              (link.source === nodeId && link.target === selectedNodes[0])
            );
          });

          if (!linkExists) {
            const newLink = { source: selectedNodes[0], target: nodeId };
            setLinks([...links, newLink]);
          }

          setSelectedNodes([]);
        } else {
          // Clicked on the same node again, reset selection
          setSelectedNodes([]);
        }
      }
    });

    // define a D3 drag behavior
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      // stop the simulation and remove the nodes and links when the component unmounts
      simulation.stop();
      nodesSelection.remove();
      linksSelection.remove();
    };
  }, [nodes, links, selectedNodes]);

  return (
    <svg ref={svgRef} width={600} height={600} style={{ border: "1px solid" }}>
      <g class="links"></g>
      <g class="nodes"></g>
    </svg>
  );
};

export default Graph;