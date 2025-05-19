from collections import defaultdict, deque
import sys

def topological_sort(nodes, connections):
    in_degree = {node: 0 for node in nodes}
    adjacency_list = defaultdict(list)

    # Build the in-degree and adjacency list
    for source, target in connections:
        in_degree[target] += 1
        adjacency_list[source].append(target)

    # Perform topological sort
    queue = deque([node for node in nodes if in_degree[node] == 0])
    result = []
    while queue:
        current_node = queue.popleft()
        result.append(current_node)
        for neighbor in adjacency_list[current_node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return result

def get_connection_symbol(connection_count):
    # Define the sequence of symbols
    symbols = ["<-->", "o--o", "x--x", "<-.->", "o-.-o", "x-.-x"]
    return symbols[connection_count % len(symbols)]

def minimize_line_crossings_with_symbols(input_text):
    # Split the input text into lines
    lines = input_text.strip().split('\n')

    # Extract nodes and connections from the lines
    nodes = set()
    connections = []
    for line in lines:
        parts = line.strip().split('-->')
        if len(parts) == 1:
            nodes.add(line.strip())

        if len(parts) == 2:
            source, target = parts
            nodes.add(source.strip())
            nodes.add(target.strip())
            connections.append((source.strip(), target.strip()))

    # Count the connections for each node
    connection_counts = defaultdict(int)
    for source, target in connections:
        connection_counts[source] += 1
        connection_counts[target] += 0  # Ensure target node is included

    # Use topological sort for better node ordering
    sorted_nodes = topological_sort(nodes, connections)

    # Print the Mermaid flowchart with symbols
    print("# PHP Components")
    print("## Class Dependency")
    print("```mermaid")
    print("graph LR;")
    for node in sorted_nodes:
        link = node.replace('byjg', 'https://opensource.byjg.com/docs/php')
        print(f"  {node}[<a href='{link}' style='text-decoration:none'>{node}🔗</a>];")
    for source, target in connections:
        symbol = get_connection_symbol(connection_counts[source])
        print(f"  {source} {symbol} {target};")
    print("  classDef default fill:#ffffff,stroke:#333,stroke-width:1.5px,color:#000,font-size:14px;")
    print("  classDef highlight fill:#ffef96,stroke:#ff9900,stroke-width:3px;")
    print("  classDef deprecated fill:#f8f8f8,stroke:#cccccc,stroke-dasharray: 5 5,stroke-width:1px,color:#999;")
    print("  classDef working-on fill:#fff3cd,stroke:#ffcc00,stroke-width:2px,color:#856404;")
    print("  classDef finished fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#155724;")
    print("  class byjg/anydataset-array deprecated;")
    print("```")

def minimize_line_crossings_from_text_file(file_path):
    # Read the contents of the file
    with open(file_path, 'r') as file:
        input_text = file.read()

    # Call the function with the input text
    minimize_line_crossings_with_symbols(input_text)

# Example usage with an external file
file_path = sys.argv[1]
minimize_line_crossings_from_text_file(file_path)
