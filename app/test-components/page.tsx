"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarBadge,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function TestComponentsPage() {
  const { theme, setTheme } = useTheme();
  const [progressValue, setProgressValue] = React.useState(60);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Shadcn Component Test Page</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Testing all button variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default" size="xs">
                  XS
                </Button>
                <Button variant="default" size="sm">
                  Small
                </Button>
                <Button variant="default" size="default">
                  Default
                </Button>
                <Button variant="default" size="lg">
                  Large
                </Button>
                <Button variant="default" size="icon">
                  <span className="sr-only">Icon</span>✓
                </Button>
                <Button variant="default" size="icon-xs">
                  <span className="sr-only">Icon XS</span>✓
                </Button>
                <Button variant="default" size="icon-sm">
                  <span className="sr-only">Icon SM</span>✓
                </Button>
                <Button variant="default" size="icon-lg">
                  <span className="sr-only">Icon LG</span>✓
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              All button variants and sizes displayed above
            </p>
          </CardFooter>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Testing all badge variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="ghost">Ghost</Badge>
              <Badge variant="link">Link</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Inputs & Textarea Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input and Textarea components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-default">Default Input</Label>
              <Input id="input-default" placeholder="Type something..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-disabled">Disabled Input</Label>
              <Input id="input-disabled" placeholder="Disabled" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textarea-default">Textarea</Label>
              <Textarea
                id="textarea-default"
                placeholder="Enter your message..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Select Section */}
        <Card>
          <CardHeader>
            <CardTitle>Select</CardTitle>
            <CardDescription>
              Select dropdown component with different sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Select</Label>
              <Select>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Small Select</Label>
              <Select>
                <SelectTrigger size="sm" className="w-[180px]">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Progress bar component</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Progress: {progressValue}%</Label>
              <Progress value={progressValue} className="mt-2" />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  setProgressValue(Math.max(0, progressValue - 10))
                }
              >
                -
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  setProgressValue(Math.min(100, progressValue + 10))
                }
              >
                +
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProgressValue(60)}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
            <CardDescription>
              Table component with header, body, and footer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>A list of recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">#001</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      Paid
                    </Badge>
                  </TableCell>
                  <TableCell>Credit Card</TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#002</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell>PayPal</TableCell>
                  <TableCell className="text-right">$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#003</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="text-xs">
                      Failed
                    </Badge>
                  </TableCell>
                  <TableCell>Bank Transfer</TableCell>
                  <TableCell className="text-right">$0.00</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">$400.00</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Section */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog</CardTitle>
            <CardDescription>Modal dialog component</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Alert Dialog Section */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Dialog</CardTitle>
            <CardDescription>Confirmation dialog component</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Show Alert</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the project and all associated
                    data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>
              Avatar components with different sizes and states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Sizes</h3>
              <div className="flex items-end gap-4">
                <Avatar size="sm">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Avatar"
                  />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <Avatar size="default">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Avatar"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar size="lg">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Avatar"
                  />
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">With Badge</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="Avatar"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <AvatarBadge>●</AvatarBadge>
                </div>
                <Avatar>
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Avatar Group</h3>
              <AvatarGroup>
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Avatar 1"
                  />
                  <AvatarFallback>A1</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Avatar 2"
                  />
                  <AvatarFallback>A2</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Avatar 3"
                  />
                  <AvatarFallback>A3</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>+5</AvatarFallback>
                </Avatar>
              </AvatarGroup>
            </div>
          </CardContent>
        </Card>

        {/* Tooltip & HoverCard Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltip & HoverCard</CardTitle>
            <CardDescription>Hover interaction components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TooltipProvider>
              <div>
                <h3 className="text-sm font-medium mb-3">Tooltip</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a tooltip!</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <div>
              <h3 className="text-sm font-medium mb-3">HoverCard</h3>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="outline">Hover for card</Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">HoverCard Title</h4>
                    <p className="text-sm text-muted-foreground">
                      This is a hover card with additional content that appears
                      on hover.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton & Separator Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton & Separator</CardTitle>
            <CardDescription>Loading placeholders and dividers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Skeleton</h3>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Separator</h3>
              <div className="space-y-2">
                <p className="text-sm">Content above</p>
                <Separator />
                <p className="text-sm">Content below</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Labels Section */}
        <Card>
          <CardHeader>
            <CardTitle>Label</CardTitle>
            <CardDescription>Form label component</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
          </CardContent>
        </Card>

        {/* Toaster Section */}
        <Card>
          <CardHeader>
            <CardTitle>Toaster (Sonner)</CardTitle>
            <CardDescription>Toast notification components</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => toast.success("Success toast!")}
            >
              Success
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.error("Error toast!")}
            >
              Error
            </Button>
            <Button variant="outline" onClick={() => toast.info("Info toast!")}>
              Info
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.warning("Warning toast!")}
            >
              Warning
            </Button>
          </CardContent>
        </Card>

        {/* Card States Section */}
        <Card>
          <CardHeader>
            <CardTitle>Card States</CardTitle>
            <CardDescription>Different card layouts and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card size="sm">
              <CardHeader>
                <CardTitle>Small Card</CardTitle>
                <CardDescription>
                  Compact card with sm size prop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is a small card variant.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>
                  Standard card with action button
                </CardDescription>
                <div className="ml-auto">
                  <Button variant="ghost" size="icon-sm">
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p>This is a default size card.</p>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Footer content here
                </p>
              </CardFooter>
            </Card>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
