import { forwardRef, useState } from "react";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DraggableAttributes,
  DraggableSyntheticListeners,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function App() {
  return <SortableGrid />;
}

const SortableGrid = () => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const [items, setItems] = useState(
    Array(300)
      .fill(0)
      .map((_, i) => i.toString())
  );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    setActiveId(active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over !== null && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableItem key={item} id={item} />
        ))}
      </SortableContext>
      <DragOverlay>{activeId ? <Item value={activeId} /> : null}</DragOverlay>
    </DndContext>
  );
};

export const SortableItem = ({ id }: { id: UniqueIdentifier }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Item
      ref={setNodeRef}
      value={id}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};

export interface Props {
  style?: {
    transform: string | undefined;
    transition: string | undefined;
  };
  listeners?: DraggableSyntheticListeners;
  attributes?: DraggableAttributes;
  value: React.ReactNode;
}

const Item = forwardRef<HTMLLIElement, Props>(({ value, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className="flex items-center justify-center list-none border size-20"
      {...props}
    >
      {value}
    </li>
  );
});

Item.displayName = "Item";

export default App;
