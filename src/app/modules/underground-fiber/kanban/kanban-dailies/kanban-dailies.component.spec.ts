import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanDailiesComponent } from './kanban-dailies.component';

describe('KanbanDailiesComponent', () => {
  let component: KanbanDailiesComponent;
  let fixture: ComponentFixture<KanbanDailiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanDailiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KanbanDailiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
