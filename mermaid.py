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

def minimize_line_crossings_from_text(input_text):
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

    # Use topological sort for better node ordering
    sorted_nodes = topological_sort(nodes, connections)

    # Print the Mermaid flowchart
    print("# PHP Components")
    print("## Class Dependency")
    print("```mermaid")
    print("graph LR;")
    for node in sorted_nodes:
        print(f"  {node};")
    for source, target in connections:
        print(f"  {source} --> {target};")
    print("```")
    print("## Documentation")
    print("{% include list.liquid %}")


def minimize_line_crossings_from_text_file(file_path):
    # Read the contents of the file
    with open(file_path, 'r') as file:
        input_text = file.read()

    # Call the function with the input text
    minimize_line_crossings_from_text(input_text)

# Example usage with an external file
file_path = sys.argv[1]
minimize_line_crossings_from_text_file(file_path)
