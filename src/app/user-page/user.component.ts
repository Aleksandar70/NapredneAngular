import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../service/user.service';
import {UserGroupDto} from '../model/userGroupDto';
import {UserGroupService} from '../service/user-group.service';
import {Router} from '@angular/router';
import {NgFlashMessageService} from 'ng-flash-messages';
import {UserManagerDto} from '../model/user-manager';
import {UserDto} from '../model/userDto';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userForm: FormGroup;
  submitted = false;
  userGroups: UserGroupDto[] = [];
  userGroupDto: UserGroupDto;
  selectedUserGroup;
  userManagers: UserManagerDto[] = [];
  selectedUserManager;
  users: UserDto[];

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private userService: UserService,
              private userGroupService: UserGroupService,
              private ngFlashMessageService: NgFlashMessageService) {
  }

  ngOnInit() {
    this.userGroupService.getUserGroups().subscribe(groups => this.userGroups = groups);
    this.userGroupService.getUserManagers().subscribe(managers => this.userManagers = managers);
    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get formControls() {
    return this.userForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
      const filteredUser = this.users.filter(user => user.username === this.formControls.username.value);
      if (filteredUser.length !== 0) {
        this.ngFlashMessageService.showFlashMessage({
          messages: ['Username already exists!'],
          dismissible: true,
          timeout: false,
          type: 'danger'
        });
      } else {
        this.addUser();
      }
    });
  }

  addUser() {
    this.userService.saveUser(this.formControls.firstName.value, this.formControls.lastName.value,
      this.formControls.username.value, this.formControls.password.value,
      this.selectedUserGroup, this.selectedUserManager).subscribe(result => {
        this.ngFlashMessageService.showFlashMessage({
          messages: ['User successfully saved!'],
          dismissible: true,
          timeout: false,
          type: 'success'
        });
      }, error => {
        this.ngFlashMessageService.showFlashMessage({
          messages: ['An error occurred while saving your user!'],
          dismissible: true,
          timeout: false,
          type: 'danger'
        });
      }
    );
  }
}
