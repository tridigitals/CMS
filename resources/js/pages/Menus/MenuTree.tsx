import React, { useRef } from 'react';
import { Trash2, GripVertical, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDrag, useDrop, DndProvider, type ConnectDropTarget, type ConnectDragPreview, type ConnectDragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from '@/components/ui/card';

interface MenuItem {
  id: number;
  title: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom';
  target?: string;
  children?: MenuItem[];
}

interface MenuTreeProps {
  items: MenuItem[];
  onMove: (draggedId: number, hoverId: number | null, position: 'before' | 'after' | 'inside') => void;
  onDelete: (id: number) => void;
  onEdit: (item: MenuItem) => void;
}

const MenuTree: React.FC<MenuTreeProps> = ({ items, onMove, onDelete, onEdit }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <MenuTreeContent items={items} onMove={onMove} onDelete={onDelete} onEdit={onEdit} />
    </DndProvider>
  );
};

const MenuTreeContent: React.FC<MenuTreeProps> = ({ items, onMove, onDelete, onEdit }) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: 'MENU_ITEM',
    hover(item: { id: number }, monitor) {
      if (!monitor.isOver({ shallow: true })) return;
      onMove(item.id, null, 'after');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  // Applying the drop ref
  drop(dropRef);

  return (
    <div ref={dropRef} className="min-h-[200px] p-4 border rounded-lg bg-white">
      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Drag items here to build your menu
        </div>
      ) : (
        items.map((item) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            onMove={onMove}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
};

interface MenuItemProps {
  item: MenuItem;
  onMove: MenuTreeProps['onMove'];
  onDelete: MenuTreeProps['onDelete'];
  onEdit: MenuTreeProps['onEdit'];
  depth?: number;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item, onMove, onDelete, onEdit, depth = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'MENU_ITEM',
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, isOverCurrent }, drop] = useDrop({
    accept: 'MENU_ITEM',
    hover(draggedItem: { id: number }, monitor) {
      if (!monitor.isOver({ shallow: true })) return;
      
      const draggedId = draggedItem.id;
      if (draggedId === item.id) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      if (!hoverBoundingRect) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      const dropPosition = hoverClientY < hoverMiddleY / 2 
        ? 'before' 
        : hoverClientY > hoverMiddleY * 1.5 
          ? 'after' 
          : 'inside';

      onMove(draggedId, item.id, dropPosition);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  // Apply the refs properly
  drag(ref);
  drop(ref);
  dragPreview(previewRef);

  return (
    <div
      ref={ref}
      style={{ 
        marginLeft: `${depth * 20}px`,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
      }}
      className={`mb-2 ${isOverCurrent ? 'bg-gray-100' : ''}`}
    >
      <Card className={`p-3 ${isOver ? 'ring-2 ring-primary' : ''}`}>
        <div className="flex items-center gap-2">
          <div ref={previewRef} className="cursor-move">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-grow">
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-gray-500">
              {item.type} • {item.url}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="text-blue-500 hover:text-blue-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      {item.children && item.children.length > 0 && (
        <div className="mt-2">
          {item.children.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              onMove={onMove}
              onDelete={onDelete}
              onEdit={onEdit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuTree;
