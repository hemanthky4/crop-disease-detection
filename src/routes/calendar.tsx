import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, ArrowLeft, Trash2, Check } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export const Route = createFileRoute("/calendar")({
  component: Page,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: "Calendar — Agri-Market" }] }),
});

type Reminder = { id: string; title: string; notes: string | null; due_date: string; done: boolean };

function Page() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [form, setForm] = useState({ title: "", notes: "", due_date: new Date().toISOString().slice(0, 10) });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("crop_reminders");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveToLocalStorage = (reminders: Reminder[]) => {
    localStorage.setItem("crop_reminders", JSON.stringify(reminders));
    setItems(reminders);
  };

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.due_date) return;
    
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: form.title,
      notes: form.notes,
      due_date: form.due_date,
      done: false
    };
    
    saveToLocalStorage([...items, newReminder]);
    setForm({ title: "", notes: "", due_date: new Date().toISOString().slice(0, 10) });
  };

  const toggle = (id: string) => { 
    saveToLocalStorage(items.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };
  
  const remove = (id: string) => { 
    saveToLocalStorage(items.filter(r => r.id !== id));
  };

  // Get dates with reminders for calendar highlights
  const reminderDates = items.map(item => new Date(item.due_date));
  
  // Get reminders for selected date
  const selectedDateString = selectedDate ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : null;
  const filteredItems = selectedDateString ? items.filter(r => r.due_date === selectedDateString) : items;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="w-4 h-4" />Back</Link>
        <h1 className="text-3xl font-bold mt-3 flex items-center gap-2"><CalendarIcon className="text-primary" />Crop Calendar & Reminders</h1>

        <div className="grid md:grid-cols-2 gap-8 mt-6">
          <div className="glassmorphism p-6 rounded-2xl border border-border shadow-sm flex justify-center">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                hasReminder: reminderDates,
              }}
              modifiersClassNames={{
                hasReminder: "font-bold text-primary underline underline-offset-4 decoration-primary decoration-2",
              }}
              className="bg-card/50 p-4 rounded-xl border border-border"
            />
          </div>

          <div>
            <form onSubmit={addReminder} className="p-6 rounded-2xl glassmorphism border border-border grid gap-3 shadow-sm mb-6">
              <h2 className="font-bold text-lg">Add New Reminder</h2>
              <Input placeholder="Activity (e.g. Sow wheat)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required />
              <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <Button type="submit" variant="hero" className="ripple">Add reminder</Button>
            </form>

            <div className="p-6 rounded-2xl glassmorphism border border-border shadow-sm">
              <h2 className="font-bold text-lg mb-4">
                {selectedDate ? `Reminders for ${selectedDate.toLocaleDateString()}` : "All Reminders"}
              </h2>
              <ul className="space-y-3">
                {filteredItems.length === 0 && <p className="text-muted-foreground py-4 text-center">No reminders for this date.</p>}
                {filteredItems.map(r => (
                  <li key={r.id} className={`p-4 rounded-xl bg-background/50 border border-border flex items-center gap-3 transition-opacity ${r.done ? "opacity-50" : ""}`}>
                    <button onClick={() => toggle(r.id)} className={`w-6 h-6 rounded-full border-2 grid place-items-center transition-colors ${r.done ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                      {r.done && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <div className={`font-semibold ${r.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.due_date}{r.notes ? ` • ${r.notes}` : ""}</div>
                    </div>
                    <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
