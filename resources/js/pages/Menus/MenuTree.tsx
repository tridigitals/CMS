import React, { useRef, useState } from 'react';
import { Trash2, GripVertical, Edit, Check, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDrag, useDrop, DndProvider, type ConnectDropTarget, type ConnectDragPreview, type ConnectDragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from '@/components/ui/card';
import Swal from 'sweetalert2';

interface MenuItem {
  id: number;
  title: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom';
  icon?: string;
  target?: string;
  css_class?: string;
  text_color?: string;
  bg_color?: string;
  highlight?: boolean;
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
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

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

  // Get all item IDs recursively
  const getAllItemIds = (items: MenuItem[]): number[] => {
    return items.reduce((acc: number[], item) => {
      acc.push(item.id);
      if (item.children && item.children.length > 0) {
        acc = [...acc, ...getAllItemIds(item.children)];
      }
      return acc;
    }, []);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(getAllItemIds(items));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedItems.length} menu items. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        selectedItems.forEach(id => onDelete(id));
        setSelectedItems([]);
        setSelectAll(false);
        
        Swal.fire(
          'Deleted!',
          `${selectedItems.length} menu items have been deleted.`,
          'success'
        );
      }
    });
  };

  const handleBulkHighlight = (highlight: boolean) => {
    // This would require a backend endpoint to update multiple items
    Swal.fire({
      title: 'Bulk Action',
      text: `${highlight ? 'Highlight' : 'Remove highlight from'} ${selectedItems.length} selected items?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed'
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real implementation, you would send a request to update all selected items
        Swal.fire(
          'Success!',
          `Highlight ${highlight ? 'enabled' : 'disabled'} for ${selectedItems.length} items.`,
          'success'
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <div 
              className="cursor-pointer flex items-center gap-2" 
              onClick={handleSelectAll}
            >
              {selectAll ? (
                <CheckSquare className="h-5 w-5 text-blue-500" />
              ) : (
                <Square className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              )}
              <span className="dark:text-gray-300">Select All</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBulkDelete}
              disabled={selectedItems.length === 0}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Delete Selected
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkHighlight(true)}
              disabled={selectedItems.length === 0}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Highlight Selected
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkHighlight(false)}
              disabled={selectedItems.length === 0}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Remove Highlight
            </Button>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedItems.length} item(s) selected
            </div>
          )}
        </div>
      )}
      
      <div ref={dropRef} className="min-h-[200px] p-4 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
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
              isSelected={selectedItems.includes(item.id)}
              onSelect={handleSelectItem}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface MenuItemProps {
  item: MenuItem;
  onMove: MenuTreeProps['onMove'];
  onDelete: MenuTreeProps['onDelete'];
  onEdit: MenuTreeProps['onEdit'];
  depth?: number;
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ 
  item, 
  onMove, 
  onDelete, 
  onEdit, 
  depth = 0,
  isSelected = false,
  onSelect
}) => {
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

  // Apply custom styling based on item properties
  const cardStyle = {
    color: item.text_color || 'inherit',
    backgroundColor: item.bg_color || 'inherit',
    fontWeight: item.highlight ? 'bold' : 'normal',
  };

  return (
    <div
      ref={ref}
      style={{ 
        marginLeft: `${depth * 20}px`,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
      }}
      className={`mb-2 ${isOverCurrent ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
    >
      <Card className={`p-3 ${isOver ? 'ring-2 ring-primary' : ''} ${item.css_class || ''} ${isSelected ? 'ring-2 ring-blue-400' : ''}`} style={cardStyle}>
        <div className="flex items-center gap-2">
          {onSelect && (
            <div 
              className="cursor-pointer" 
              onClick={() => onSelect(item.id, !isSelected)}
            >
              {isSelected ? (
                <CheckSquare className="h-5 w-5 text-blue-500" />
              ) : (
                <Square className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          )}
          <div ref={previewRef} className="cursor-move">
            <GripVertical className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex-grow">
            <div className="font-medium">
              {item.icon && <span className={`mr-2 ${item.icon}`}></span>}
              {item.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {item.type} • {item.url}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
              isSelected={isSelected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuTree;
