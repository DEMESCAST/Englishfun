// ==================== ENGLISH FUN - FIREBASE AUTHENTICATION ====================

const EFAuth = {
    currentUser: null,
    auth: null,

    init() {
        this.auth = firebase.auth();
        this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    },

    getCurrentUser() {
        return this.auth.currentUser;
    },

    getUid() {
        const user = this.auth.currentUser;
        return user ? user.uid : null;
    },

    isSignedIn() {
        return !!this.auth.currentUser;
    },

    deriveEmail(playerCode) {
        const normalized = playerCode.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return normalized + '@players.englishfun.invalid';
    },

    async createAccount(playerCode, pin) {
        const email = this.deriveEmail(playerCode);
        const credential = firebase.auth.EmailAuthProvider.credential(email, pin);
        const userCredential = await this.auth.createUserWithEmailAndPassword(email, pin);
        return userCredential.user;
    },

    async signIn(playerCode, pin) {
        const email = this.deriveEmail(playerCode);
        const userCredential = await this.auth.signInWithEmailAndPassword(email, pin);
        return userCredential.user;
    },

    async signOut() {
        await this.auth.signOut();
        this.currentUser = null;
    },

    onAuthStateChanged(callback) {
        this.auth.onAuthStateChanged(callback);
    }
};
