def build_knowledge_graph(events):
    nodes = []
    links = []
    
    node_ids = set()
    
    def add_node(node_id, name, group, val=1):
        if node_id not in node_ids:
            nodes.append({"id": node_id, "name": name, "group": group, "val": val})
            node_ids.add(node_id)
            
    # Groups: 1=Event, 2=Actor, 3=Category, 4=Region
    
    for event in events:
        event_node_id = event.event_id
        # Main Event Node
        add_node(event_node_id, event.title[:40] + "...", group=1, val=3)
        
        # Actors
        for actor in event.actors:
            actor_id = f"actor_{actor.lower()}"
            add_node(actor_id, actor.upper(), group=2, val=2)
            links.append({"source": actor_id, "target": event_node_id, "label": "involved_in"})
            
        # Regions
        for region in event.regions:
            region_id = f"region_{region.lower().replace(' ', '_')}"
            add_node(region_id, region.upper(), group=4, val=1.5)
            links.append({"source": event_node_id, "target": region_id, "label": "located_in"})
            
        # Categories
        for ev_type in event.event_types:
            type_id = f"type_{ev_type.lower()}"
            add_node(type_id, ev_type.upper(), group=3, val=2)
            links.append({"source": event_node_id, "target": type_id, "label": "is_type"})
            
    return {"nodes": nodes, "links": links}
