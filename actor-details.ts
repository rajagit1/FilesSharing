import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { ConferenceData } from '../../providers/conference-data';
import { FireBaseService } from '../../services/firebase.service';
import { TitleCasePipe } from '@angular/common';
import * as _ from "lodash";
import * as moment from 'moment';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastController, ModalController, LoadingController } from '@ionic/angular';
import { UserData } from '../../providers/user-data';
import { ActivityCommentsPage } from '../activity-comments/activity-comments.page';
import { ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { ThrowStmt } from '@angular/compiler';
@Component({
  selector: 'app-actor-details',
  templateUrl: './actor-details.page.html',
  styleUrls: ['./actor-details.page.scss'],
})
export class ActorDetailsPage implements OnInit {

  //safeURL: any;
  slideOptsOne = {
    initialSlide: 0,
    isEndSlide: false,
    slidesPerView: 1,
    isBeginningSlide: false,
    autoplay: false,
    slideShadows: true,
    onlyExternal: true,
    pager: false
  };
  safeURLs = [];
  actorData: any;
  p_bar_value1: number;
  postData: any = {};
  isLoaded: boolean = false;
  userprofileName: string = ""
  storyCount: number;
  associatedStories = [];
  defaultHref = '/app/tabs/schedule';
  segment = "image";
  disablePrevBtn = true;
  disableNextBtn = false;

  @ViewChild('slideWithNav', { static: false }) ionSlides: IonSlides;

  dummyData = [
    {
      synopsis: "1",
      title: "1",
      imaage: "",
      generType: "1",
      uploadedBy: "1",
      uploadedOn: "1"
    },
    {
      synopsis: "1",
      title: "1",
      imaage: "",
      generType: "1",
      uploadedBy: "1",
      uploadedOn: "1"
    }
  ];
  tabType: string = "image";
  docId: string;
  imageList: any;
  postComment: string = "";
  userName: any;
  currentImageIndex: any;
  loadingProgress: any;
  commentsObj: any[];
  constructor(public router: Router,
    public userData: UserData,
    private youtube: YoutubeVideoPlayer,
    private confData: ConferenceData,
    private firebase: FireBaseService,
    public ngFireAuth: AngularFireAuth,
    public toastController: ToastController,
    private titlecasePipe: TitleCasePipe, public modalController: ModalController,
    private _sanitizer: DomSanitizer, private loadingCtrl: LoadingController, ) {

  }
  ngOnInit() {
    this.loginCheck();
    this.imageList = [];
    this.actorData = this.confData.actorData;
    this.showImages();
    this.commentsObj = [];
    this.tabType = "Image";
    setTimeout(() => {
      this.fetchComments(this.actorData['actorName']);
    }, 1000);
  }
  ionViewDidEnter() {
    this.commentsObj = [];
    this.imageList = [];

    this.loginCheck();
    this.showImages();

    this.ngFireAuth.onAuthStateChanged((obj) => {
      if (_.isEmpty(obj)) {
        this.presentToast('Please login/signup to see more!', 'toast-success');
        this.router.navigateByUrl('/signUp');
        return;
      }
    });
    this.actorData = this.confData.actorData;
    this.transformName();
    this.postData = this.firebase.postData;
    //let profile=this.actorData.profiles?this.actorData.profiles.split('=')[1]:this.actorData.profiles;
    //this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/'+profile);
<<<<<<< HEAD
    this.actorData.profilesArray.forEach((element) => {
      let profile = element ? element.split('=')[1] : element;
      this.safeURLs.push(this._sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + profile));
    });
    this.runDeterminateProgress();
=======
    this.safeURLs = [];
    this.actorData.profilesArray.forEach( (element) => {
      let profile=element?element.split('=')[1]:element;
      this.safeURLs.push(this._sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/'+profile));
   });
     this.runDeterminateProgress();
>>>>>>> 71fba30fa321d0b0bba8464025f64d1538ca80ba
    this.filterStories();
    this.showSkeltonLoading();
    setTimeout(() => {
      this.fetchComments(this.actorData['actorName']);
    }, 1000);
  }
  async saveComments(obj) {
    let postObj = {};
    postObj['actorId'] = this.userName;
    postObj['imagePosition'] = this.currentImageIndex;
    postObj['commentText'] = this.postComment;
    postObj['uploadedBy'] = this.userName;
    postObj['uploadedOn'] = moment().format('YYYY-MM-DD hh:mm:ss A').toString();
    postObj['thumnail'] = this.actorData['image'];
    this.loadingProgress = await this.loadingCtrl.create({
      message: 'Saving your comments..',
      duration: 200
    });
    await this.loadingProgress.present();
    this.firebase.createActorComment(postObj).then(creationResponse => {
      if (creationResponse != null) {
        this.postComment = "";
        this.fetchComments(this.userName);
      }
    })
      .catch((error) => this.presentToast(error.message, 'toast-danger'));
  }
  fetchComments(userName) {

    this.commentsObj = [];
    let pageIndex = this.currentImageIndex;
    this.firebase.readCommentsActors(this.actorData['actorName']).then(element => {
      if (!_.isEmpty(element['docs'])) {
        element['docs'].forEach(arg => {
          this.commentsObj.push(arg.data());
        });
        console.log('here');
        console.log(this.commentsObj);
      }
    });
    setTimeout(() => {
      this.commentsObj = _.filter(this.commentsObj, { 'imagePosition': pageIndex });
    }, 1000);

  }
  showImages() {
    this.imageList = [];
    this.firebase.filterActors(this.userName).get().subscribe((querySnapshot) => {
      this.imageList = [];
      querySnapshot.forEach((doc) => {
        this.docId = doc.id;
        let actorObj = doc.data();

        if (!_.isEmpty(actorObj['imageArray'])) {

          actorObj['imageArray'].forEach((element, idx) => {
            if (idx < 5) {
              this.imageList.push(element);
            }
          });
        }


      });

    });

  }
  filterStories() {
    this.storyCount = 0;
    this.postData.forEach(element => {
      if (this.actorData['associatedStories'].indexOf(element['id']) >= 0) {
        this.associatedStories.push(element);
      }
    });
    this.storyCount = this.actorData['associatedStories'].length;
    this.associatedStories = _.uniqBy(this.associatedStories, 'title');
  }
  showSkeltonLoading() {
    setTimeout(() => {
      this.isLoaded = true;
    }, 1000);
  }
  runDeterminateProgress() {

    for (let index = 0; index <= 100; index++) {
      this.setPercentBar(+index);
    }
  }

  setPercentBar(i) {
    setTimeout(() => {
      let apc = (i / 100)

      this.p_bar_value1 = apc;

    }, 30 * i);
  }
  async logout() {
    if (this.confData.isFromPage == 'activities') {
      this.router.navigateByUrl('/app/tabs/daily-activities');
      this.actorData = {};
    }
    else if (this.confData.isFromPage == 'activity-comments') {
      //this.modalController.dismiss();
      this.router.navigateByUrl('/app/tabs/daily-activities');
      this.actorData = {};
    }
    else {
      this.router.navigateByUrl('/app/tabs/schedule');
      this.actorData = {};
    }
  }
  transformName() {
    this.userprofileName = this.titlecasePipe.transform(this.actorData.displayName);
  }
  async presentToast(msg, type) {
    const toast = await this.toastController.create({
      message: msg,
      cssClass: type,
      duration: 1500,
      position: 'middle'
    });
    toast.present();
  }
  ago(time) {
    let difference = moment(time).diff(moment());
    return moment.duration(difference).humanize();
  }
  changeCategory(ev) {
    this.segment = ev.detail.value;
    this.isLoaded = false;
    this.showSkeltonLoading();
    this.showImages();
    setTimeout(() => {
      this.fetchComments(this.actorData['actorName']);
    }, 1000);
  }
  loginCheck() {
    if (_.isEmpty(this.userData.userName)) {

      this.router.navigateByUrl('/signUp');
      return false;
    } else {
      this.userName = this.userData.userName;
      return true;
    }
  }
  goToDetail(arg) {
    if (arg !== null) {
      this.confData.routingData = arg;
      this.confData.isFromPage = 'actor-details';
      setTimeout(() => {
        this.userData.getUsername().then((username) => {
          if (username) {
            this.userData.userName = username;
          }
        });
      });
      if (this.loginCheck()) {
        this.router.navigateByUrl('/app/tabs/speakers/speaker-details');
      } else {
        this.presentToast('Please login/signup to see more!', 'toast-success');
        this.router.navigateByUrl('/signUp');
      }
      //});
      // }
    }
  }
  //Move to Next slide
  slideNext(object, slideView) {
    slideView.slideNext(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });

  }

  //Move to previous slide
  slidePrev(object, slideView) {
    slideView.slidePrev(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });;
  }

  //Method called when slide is changed by drag or navigation
  SlideDidChange(object, slideView) {
    this.checkIfNavDisabled(object, slideView);
    slideView.getActiveIndex().then((val) => {
      this.currentImageIndex = val;
      this.postComment = "";
      this.fetchComments(this.userName);

    });
  }
  //Call methods to check if slide is first or last to enable disbale navigation  
  checkIfNavDisabled(object, slideView) {
    this.checkisBeginning(object, slideView);
    this.checkisEnd(object, slideView);
  }
  checkisBeginning(object, slideView) {
    slideView.isBeginning().then((istrue) => {
      object.isBeginningSlide = istrue;
    });
  }
  checkisEnd(object, slideView) {
    slideView.isEnd().then((istrue) => {
      object.isEndSlide = istrue;
    });
  }
  next() {
    this.ionSlides.slideNext();
  }

  prev() {
    this.ionSlides.slidePrev();
  }
}
