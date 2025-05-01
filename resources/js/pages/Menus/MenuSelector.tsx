import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Menu {
  id: number;
  name: string;
}

interface Props {
  menus: Menu[];
  currentMenuId: number | null;
  onChange: (id: number) => void;
}

const MenuSelector = ({ menus, currentMenuId, onChange }: Props) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 max-w-xs">
        <Select
          value={currentMenuId?.toString()}
          onValueChange={(value) => onChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a menu to edit..." />
          </SelectTrigger>
          <SelectContent>
            {menus.map((menu) => (
              <SelectItem key={menu.id} value={menu.id.toString()}>
                {menu.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentMenuId && (
        <Button asChild variant="outline">
          <Link href={`/menus/${currentMenuId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Menu
          </Link>
        </Button>
      )}

      <Button asChild variant="outline">
        <Link href="/menus/create">
          <Plus className="h-4 w-4 mr-2" />
          Create New Menu
        </Link>
      </Button>
    </div>
  );
};

export default MenuSelector;
