import cv2
import math
import numpy as np
from flask import Flask, render_template

import os
from wtforms import SubmitField
from flask_wtf import FlaskForm
from flask_uploads import UploadSet, IMAGES, configure_uploads
from flask_wtf.file import FileField, FileAllowed, FileRequired
from flask import Flask, render_template, send_from_directory, url_for

app = Flask(__name__, template_folder="templates")
app.config['SECRET_KEY'] = 'randomstring'
app.config['UPLOADED_PHOTOS_DEST'] = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')

photos = UploadSet('photos', IMAGES)
configure_uploads(app, photos)


class UploadForm(FlaskForm):
    file_url = None
    photo = FileField(
        validators=[
            FileAllowed(photos, 'Only input images silly'),
            FileRequired('Make sure the file is not empty')
        ]
    )
    submit = SubmitField('Upload')


@app.route('/uploads/<filename>')
def get_file(filename):
    return send_from_directory(app.config['UPLOADED_PHOTOS_DEST'], filename)


@app.route('/', methods=['GET', 'POST'])
def upload_image():
    form = UploadForm()

    if form.validate_on_submit():
        filename = photos.save(form.photo.data)
        file_url = url_for('get_file', filename=filename)
        return render_template('index.html', form=form, file_url=file_url)
    else:
        file_url = None
        print("invalid")
        return render_template("index.html", form=form, file_url=UploadForm())


if __name__ == "__main__":
    app.run()
