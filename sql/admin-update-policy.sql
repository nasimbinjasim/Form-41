-- Already ran schema.sql? Run only this so admin can change status.

drop policy if exists "public update applications" on public.applications;
create policy "public update applications"
  on public.applications for update
  to anon, authenticated
  using (true)
  with check (true);
