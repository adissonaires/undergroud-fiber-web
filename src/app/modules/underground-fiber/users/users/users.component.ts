import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NgClass} from "@angular/common";
import {User, UsersService} from "../users.service";
import {AuthUtils} from "../../../../core/auth/auth.utils";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-users',
  imports: [
    NgClass,
    FormsModule
  ],
  templateUrl: './users.component.html',
  standalone: true,
  styleUrl: './users.component.scss',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit
{
  users: User[] = [];

  // Controle do modal
  showModal: boolean = false;
  isEditMode: boolean = false;

  showConfirmModal:boolean = false;
  confirmMessage: string = '';
  userToChange: User | null = null;

  // Objeto para o formulário (create/edit)
  formUser: User = {
    id: null,
    name: '',
    email: '',
    profile: 'USER',
    status: 'ACTIVE'
  };


  constructor(private _usersService: UsersService,
              private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void
  {
    this.loadUsers();
  }

  /**
   * Carrega lista de usuários
   */
  loadUsers(): void
  {
    this._usersService.getAllUsers().subscribe((response: User[]) => {
      this.users = response;
      this._cdr.markForCheck();
    });
  }

  openModalForCreate(): void
  {
    // Modo criação
    this.isEditMode = false;
    this.formUser = {
      id: null,
      name: '',
      email: '',
      profile: 'USER',
      status: 'ACTIVE'
    };

    this.showModal = true;
  }

  /**
   * Abre modal para editar usuário existente
   */
  openModalForEdit(user: User): void
  {
    // Modo edição
    this.isEditMode = true;

    // Faz um clone do usuário para editar sem mexer direto na lista
    this.formUser = { ...user };

    this.showModal = true;
  }

  /**
   * Fecha modal sem salvar
   */
  closeModal(): void
  {
    this.showModal = false;
  }

  /**
   * Salva (create/update) e fecha modal
   */
  saveUser(): void
  {
    if (this.isEditMode && this.formUser.id)
    {
      // Editar (PUT /users/{id})
      this._usersService.updateUser(this.formUser.id, this.formUser)
          .subscribe(() => {
            // Atualiza a lista local
            this.loadUsers();
            // Fecha o modal
            this.closeModal();
          });
    }
    else
    {
      // Criar (POST /users)
      this._usersService.createUser(this.formUser)
          .subscribe(() => {
            // Atualiza a lista local
            this.loadUsers();
            // Fecha o modal
            this.closeModal();
          });
    }
  }

  trackByFn(index: number, user: any): any
  {
    return user.id || index;
  }


  confirmDeactivate(user: User): void
  {
    this.userToChange = user;
    this.confirmMessage = `Are you sure you want to deactivate this user?`;
    this.showConfirmModal = true;
  }

  confirmActivate(user: User): void
  {
    this.userToChange = user;
    this.confirmMessage = `Are you sure you want to activate this user?`;
    this.showConfirmModal = true;
  }

  /**
   * Responde "Yes" na modal de confirmar
   */
  confirmYes(): void
  {
    if (!this.userToChange) return;

    // Se o status atual é ACTIVE => iremos INACTIVAR
    // Se o status atual é INACTIVE => iremos ACTIVAR
    const newStatus = this.userToChange.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Monta objeto modificado
    const updatedUser: User = {
      ...this.userToChange,
      status: newStatus
    };

    // Chama updateUser no service
    this._usersService.updateUser(updatedUser.id!, updatedUser)
        .subscribe(() => {
          // Recarregar lista
          this.loadUsers();
          // Fecha modal de confirmação
          this.showConfirmModal = false;
          this.userToChange = null;
        });
  }

  /**
   * Responde "No" na modal de confirmar
   */
  confirmNo(): void
  {
    this.showConfirmModal = false;
    this.userToChange = null;
  }
}
